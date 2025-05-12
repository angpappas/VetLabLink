namespace VetLIS.Models.Hl7Server
{
    using System;
    using System.Collections.Concurrent;
    using System.Net;
    using System.Net.Sockets;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Threading;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Options;
    using VetLIS.Data;

    public class Hl7TcpListener : BackgroundService
    {
        private static readonly ConcurrentQueue<string> logQueue = new ConcurrentQueue<string>();
        private static readonly StringBuilder logBuilder = new StringBuilder();
        private static readonly object logLock = new object();
        private const int MaxLogLines = 1000;

        private const int TcpTimeout = 300000; // timeout value for receiving TCP data in milliseconds
        private static object logSync = new object();
        private readonly IServiceScopeFactory srvScopeFactory;
        private readonly ApplicationDbContext db;
        private readonly IOptions<AppSettings> applicationSettings;
        private TcpListener tcpListener;
        private Thread tcpListenerThread;
        private int listenerPort;
        private bool sendACK = true;
        private bool runThread = true;
        private Encoding encoder = Encoding.Default;
        private bool tlsRequired = false;
        private X509Certificate2? certificate;
        private CancellationTokenSource srcCancelToken = new CancellationTokenSource();

        private ConcurrentQueue<string> errorQueue = new ConcurrentQueue<string>();

        public Hl7TcpListener(IServiceScopeFactory serviceScopeFactory, IOptions<AppSettings> appSettings)
        {
            this.srvScopeFactory = serviceScopeFactory;
            var scope = this.srvScopeFactory.CreateScope();
            this.db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            this.tlsRequired = false;
            this.certificate = null;
            this.applicationSettings = appSettings;
        }

        public Hl7TcpListener(int port)
        {
            this.listenerPort = port;
            this.tlsRequired = false;
            this.certificate = null;
        }

        public Hl7TcpListener(int port, Encoding encoding)
        {
            this.listenerPort = port;
            this.encoder = encoding;
            this.certificate = null;
        }

        public Hl7TcpListener(int port, X509Certificate2 certificate)
        {
            this.listenerPort = port;
            this.tlsRequired = true;
            this.certificate = certificate;
        }

        public Hl7TcpListener(int port, Encoding encoding, X509Certificate2 certificate)
        {
            this.listenerPort = port;
            this.encoder = encoding;
            this.tlsRequired = true;
            this.certificate = certificate;
        }

        public string[] GetError()
        {
            string[] errors = new string[this.errorQueue.Count];
            this.errorQueue.CopyTo(errors, 0);
            return errors;
        }

        public override async Task StartAsync(CancellationToken cancellationToken)
        {
            var settings = await this.db.Settings!.AsNoTracking().FirstOrDefaultAsync();
            this.listenerPort = settings?.Hl7Port ?? 6661;

            this.runThread = true;
            this.tcpListener = new TcpListener(IPAddress.Any, this.listenerPort);
            this.tcpListenerThread = new Thread(new ThreadStart(this.StartListener));
            this.tcpListenerThread.Start();

            this.LogInformation("Starting HL7 listener on port " + this.listenerPort);
            this.LogInformation($"Message encoding: {this.encoder.EncodingName}");

            if (!this.sendACK)
            {
                this.LogInformation("Acknowledgements (ACKs) will not be sent");
            }

            this.LogInformation("TLS: " + this.tlsRequired);

            await base.StartAsync(cancellationToken);
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            this.tcpListener.Stop();
            this.runThread = false;
            this.srcCancelToken.Cancel();
            this.srcCancelToken.Dispose();
            this.srcCancelToken = new CancellationTokenSource();
            this.errorQueue.Clear();

            await Task.Delay(5000);

            await base.StopAsync(cancellationToken);
        }

        public string GetServerLog()
        {
            lock (logLock)
            {
                return logBuilder.ToString();
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
        }

        private void StartListener()
        {
            try
            {
                this.errorQueue.Clear();

                // create a cancellation token linked to the source cancellation token
                CancellationToken cancelToken = this.srcCancelToken.Token;
                Thread clientThread;

                this.tcpListener.Start();

                while (this.runThread)
                {
                    TcpClient client = this.tcpListener.AcceptTcpClientAsync(cancelToken).Result;
                    this.LogInformation("New client connection accepted from " + client.Client.RemoteEndPoint);
                    ////if (this.tlsRequired)
                    ////{
                    ////    clientThread = new Thread(new ParameterizedThreadStart(this.ReceiveTLSData));
                    ////}
                    ////else
                    ////{
                    ////    clientThread = new Thread(new ParameterizedThreadStart(this.ReceiveData));
                    ////}

                    clientThread = new Thread(new ParameterizedThreadStart(this.ReceiveData));

                    // start the client thread to wait for a client connection
                    clientThread.Start(client);
                }

                this.tcpListener.Stop();
            }
            catch (System.OperationCanceledException)
            {
                this.LogInformation("Cancel requested. Closing TCP Listener on port " + this.listenerPort);
            }
            catch (Exception e)
            {
                this.errorQueue.Enqueue(e.Message);
            }
        }

        private void ReceiveData(object client)
        {
            // create a cancellation token linked to the source cancellation token
            CancellationToken cancelToken = this.srcCancelToken.Token;

            // generate a random sequence number to use for the file names
            Random random = new Random(Guid.NewGuid().GetHashCode());
            int filenameSequenceStart = random.Next(0, 1000000);

            TcpClient tcpClient = (TcpClient)client;
            NetworkStream clientStream;

            clientStream = tcpClient.GetStream();
            clientStream.ReadTimeout = TcpTimeout;
            clientStream.WriteTimeout = TcpTimeout;

            byte[] messageBuffer = new byte[4096];
            int bytesRead;
            string messageData = string.Empty;
            int messageCount = 0;
            int consecutiveZeroReads = 0;

            while (this.runThread)
            {
                bytesRead = 0;
                try
                {
                    // Wait until a client application submits a message
                    bytesRead = clientStream.ReadAsync(messageBuffer, 0, messageBuffer.Length, cancelToken).Result;

                    if (this.applicationSettings.Value.MllpDebug)
                    {
                        this.WriteToMllpLog(messageBuffer, bytesRead);
                    }
                }
                catch (System.OperationCanceledException)
                {
                    this.LogInformation("Cancel initiated. Closing connection to " + tcpClient.Client.RemoteEndPoint);
                }
                catch
                {
                    this.LogInformation("Connection from " + tcpClient.Client.RemoteEndPoint + " has ended");
                }

                if (bytesRead == 0)
                {
                    this.LogInformation("The client " + tcpClient.Client.RemoteEndPoint + " has disconnected");
                }
                else
                {
                    // Message buffer received successfully
                    messageData += this.encoder.GetString(messageBuffer, 0, bytesRead);
                }

                if (bytesRead > 0)
                {
                    consecutiveZeroReads = 0;
                }
                else
                {
                    consecutiveZeroReads++;
                }

                if (messageData.Length == 0 || consecutiveZeroReads > 1)
                {
                    break;
                }

                // Find a VT character, this is the beginning of the MLLP frame
                int start = messageData.IndexOf((char)0x0B);
                if (start >= 0)
                {
                    // Search for the end of the MLLP frame (a FS character)
                    int end = messageData.IndexOf((char)0x1C);
                    if (end > start)
                    {
                        messageCount++;
                        try
                        {
                            // create a HL7message object from the message received. Use this to access elements needed to populate the ACK message and file name of the archived message
                            GenericHl7Message message = new GenericHl7Message(messageData.Substring(start + 1, end - (start + 1)));

                            if (end + 1 < messageData.Length)
                            {
                                messageData = messageData.Substring(end + 1);
                            }
                            else
                            {
                                messageData = string.Empty;
                            }

                            string messageTrigger = message.GetMessageTrigger();
                            string messageControlID = message.GetHL7Item("MSH-10")[0];

                            // Write the HL7 message to file.
                            this.WriteMessageToDb(message);

                            // send ACK message is MSH-15 is set to AL and ACKs not disabled by -NOACK command line switch
                            if (this.sendACK)
                            {
                                this.LogInformation("Sending ACK (Message Control ID: " + messageControlID + ")");

                                // generate ACK Message and send in response to the message received
                                string response = this.GenerateACK(message.ToString());  // TO DO: send ACKS if set in message header, or specified on command line

                                byte[] encodedResponse = this.encoder.GetBytes(response);

                                // Send response
                                try
                                {
                                    clientStream.Write(encodedResponse, 0, encodedResponse.Length);
                                    clientStream.Flush();
                                }
                                catch (Exception e)
                                {
                                    // A network error has occurred
                                    this.LogWarning("An error has occurred while sending an ACK to the client " + tcpClient.Client.RemoteEndPoint);
                                    this.LogWarning(e.Message);
                                    break;
                                }
                            }
                        }
                        catch (Exception e)
                        {
                            this.errorQueue.Enqueue(e.Message);
                            break;
                        }
                    }
                }
            }

            // close the stream and tcp client. Exit thread.
            try
            {
                this.LogInformation("Total messages received from " + tcpClient.Client.RemoteEndPoint + " - " + messageCount);
                clientStream.Close();
                clientStream.Dispose();
                tcpClient.Close();
                tcpClient.Dispose();
            }
            catch
            {
                // nothing to do.
            }
        }

        private void WriteToMllpLog(byte[] messageBuffer, int count)
        {
            lock (logSync)
            {
                using var fileStream = new FileStream("./mllp.log", FileMode.Append, FileAccess.Write);
                fileStream.Write(messageBuffer, 0, count);
            }
        }

        private void WriteMessageToDb(GenericHl7Message message)
        {
            this.LogInformation("Received message. Saving to DB");

            // write the HL7 message to file
            try
            {
                var dbMessages = this.ParseMessage(message);

                using var scope = this.srvScopeFactory.CreateScope();
                using var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                foreach (var dbMessage in dbMessages)
                {
                    var exists = db.Messages.Any(x => x.MessageDate == dbMessage.MessageDate && x.ApplicationType == dbMessage.ApplicationType);
                    if (!exists)
                    {
                        db.Messages.Add(dbMessage);
                    }
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                this.LogError("Error saving message to database: " + ex.Message + " " + ex.InnerException?.Message);
                this.errorQueue.Enqueue(ex.Message);
                this.errorQueue.Enqueue(ex.InnerException?.Message);
            }
        }

        private IEnumerable<Hl7Message> ParseMessage(GenericHl7Message hl7Message)
        {
            var result = new List<Hl7Message>();
            string message = hl7Message.ToString().Replace("\r\n", "\n").Replace("\r", "\n");
            var appType = Hl7Message.ApplicationTypes.Unknown;
            var category = Hl7Message.MessageCategories.Unknown;

            if (message.IndexOf("LIS|PC") != -1)
            {
                appType = Hl7Message.ApplicationTypes.WoodleyInsightV3Plus;
                category = Hl7Message.MessageCategories.Hematology;
                result.Add(new Hl7Message
                {
                    ApplicationType = appType,
                    Category = category,
                    Message = message,
                    ReceivedOn = DateTime.Now,
                    MessageDate = this.ParseMessageDate(hl7Message.GetHL7Item("OBR-7")[0]),
                });
            }
            else if (message.IndexOf("DH56|Woodley") != -1)
            {
                appType = Hl7Message.ApplicationTypes.DH56WoodleyInsightViaPlus;
                category = Hl7Message.MessageCategories.ImmunoAssay;
                string[] lines = message.Split('\n');
                string msh = lines[0];
                for (int i = 1; i < lines.Length; i++)
                {
                    string line = lines[i];
                    if (line.StartsWith("PID|"))
                    {
                        var sb = new StringBuilder();
                        sb.AppendLine(msh);
                        sb.AppendLine(line);
                        int j = i + 1;
                        while (j < lines.Length)
                        {
                            string lineJ = lines[j];
                            if (!lineJ.StartsWith("PID|"))
                            {
                                sb.AppendLine(lineJ);
                            }
                            else
                            {
                                break;
                            }

                            j++;
                        }

                        var craftedHl7 = new GenericHl7Message(sb.ToString().Replace("\r\n", "\r").Replace("\n", "\r"));

                        result.Add(new Hl7Message
                        {
                            ApplicationType = appType,
                            Category = category,
                            Message = sb.ToString().Replace("\r\n", "\n").Replace("\r", "\n"),
                            ReceivedOn = DateTime.Now,
                            MessageDate = this.ParseMessageDate(craftedHl7.GetHL7Item("OBR-7")[0]),
                        });
                    }
                }
            }
            else if (message.IndexOf("CelercareV") != -1)
            {
                appType = Hl7Message.ApplicationTypes.CelercareVInsightVChem;
                category = Hl7Message.MessageCategories.Biochemistry;
                result.Add(new Hl7Message
                {
                    ApplicationType = appType,
                    Category = category,
                    Message = message,
                    ReceivedOn = DateTime.Now,
                    MessageDate = this.ParseMessageDate(hl7Message.GetHL7Item("OBR-7")[0]),
                });
            }
            else if (message.IndexOf("SMT-120V") != -1)
            {
                appType = Hl7Message.ApplicationTypes.Smt120V;
                category = Hl7Message.MessageCategories.Biochemistry;
                result.Add(new Hl7Message
                {
                    ApplicationType = appType,
                    Category = category,
                    Message = message,
                    ReceivedOn = DateTime.Now,
                    MessageDate = this.ParseMessageDate(hl7Message.GetHL7Item("OBR-7")[0]),
                });
            }
            else if (message.IndexOf("Genrui|VH30") != -1)
            {
                appType = Hl7Message.ApplicationTypes.GenruiVH30;
                category = Hl7Message.MessageCategories.Hematology;
                result.Add(new Hl7Message
                {
                    ApplicationType = appType,
                    Category = category,
                    Message = message,
                    ReceivedOn = DateTime.Now,
                    MessageDate = this.ParseMessageDate(hl7Message.GetHL7Item("OBR-7")[0]),
                });
            }
            else
            {
                appType = Hl7Message.ApplicationTypes.Unknown;
                category = Hl7Message.MessageCategories.Unknown;
                string[] lines = message.Split('\n');
                string msh = lines[0];
                for (int i = 1; i < lines.Length; i++)
                {
                    string line = lines[i];
                    if (line.StartsWith("PID|"))
                    {
                        var sb = new StringBuilder();
                        sb.AppendLine(msh);
                        sb.AppendLine(line);
                        int j = i + 1;
                        while (j < lines.Length)
                        {
                            string lineJ = lines[j];
                            if (!lineJ.StartsWith("PID|"))
                            {
                                sb.AppendLine(lineJ);
                            }
                            else
                            {
                                break;
                            }

                            j++;
                        }

                        var craftedHl7 = new GenericHl7Message(sb.ToString().Replace("\r\n", "\r").Replace("\n", "\r"));

                        result.Add(new Hl7Message
                        {
                            ApplicationType = appType,
                            Category = category,
                            Message = sb.ToString().Replace("\r\n", "\n").Replace("\r", "\n"),
                            ReceivedOn = DateTime.Now,
                            MessageDate = this.ParseMessageDate(craftedHl7.GetHL7Item("OBR-7")[0]),
                        });
                    }
                }
            }

            return result;
        }

        private DateTime ParseMessageDate(string dateString)
        {
            string[] formats = new string[] { "yyyyMMddHHmmss", "MMddyyyyHHmmss", "ddMMyyyyHHmmss" };
            foreach (var f in formats)
            {
                if (DateTime.TryParseExact(dateString, f, null, System.Globalization.DateTimeStyles.None, out DateTime result))
                {
                    return result;
                }
            }

            return DateTime.Now;
        }

        private string GenerateACK(string originalMessage)
        {
            // create a HL7Message object using the original message as the source to obtain details to reflect back in the ACK message
            GenericHl7Message tmpMsg = new GenericHl7Message(originalMessage);
            string trigger = tmpMsg.GetHL7Item("MSH-9.2")[0];
            string originatingApp = tmpMsg.GetHL7Item("MSH-3")[0];
            string originatingSite = tmpMsg.GetHL7Item("MSH-4")[0];
            string messageID = tmpMsg.GetHL7Item("MSH-10")[0];
            string processingID = tmpMsg.GetHL7Item("MSH-11")[0];
            string hl7Version = tmpMsg.GetHL7Item("MSH-12")[0];
            string ackTimestamp = DateTime.Now.ToString("yyyyMMddhhmm");

            StringBuilder ACKString = new StringBuilder();
            ACKString.Append((char)0x0B);
            ACKString.Append("MSH|^~\\&|HL7Listener|HL7Listener|" + originatingSite + "|" + originatingApp + "|" + ackTimestamp + "||ACK^" + trigger + "|" + messageID + "|" + processingID + "|" + hl7Version);
            ACKString.Append((char)0x0D);
            ACKString.Append("MSA|CA|" + messageID);
            ACKString.Append((char)0x1C);
            ACKString.Append((char)0x0D);
            return ACKString.ToString();
        }

        private void LogInformation(string message)
        {
            this.AddLogEntry(DateTime.Now + ": " + message);
        }

        private void LogWarning(string message)
        {
            this.AddLogEntry("WARNING: " + message);
        }

        private void LogError(string message)
        {
            this.AddLogEntry("ERROR: " + message + "\n");
        }

        private void ClearLog()
        {
            lock (logLock)
            {
                logBuilder.Clear();
                logQueue.Clear();
            }
        }

        private void AddLogEntry(string message)
        {
            lock (logLock)
            {
                logQueue.Enqueue(message);
                if (logQueue.Count > MaxLogLines)
                {
                    logQueue.TryDequeue(out _);
                }

                logBuilder.Clear();
                foreach (var log in logQueue)
                {
                    logBuilder.AppendLine(log);
                }
            }
        }
    }
}
