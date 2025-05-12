using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VetLabLink
{
    public partial class Form1 : Form
    {
        private Process psiProcess = null;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            try
            {
                var psi = new ProcessStartInfo();
                string appDirectory = AppDomain.CurrentDomain.BaseDirectory;
                psi.FileName = Path.Combine(appDirectory, "..\\vetlis\\vetlis.exe");
                psi.WorkingDirectory = Path.Combine(appDirectory, "..\\vetlis");
                psi.UseShellExecute = true;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                psiProcess = Process.Start(psi);
            }
            catch
            {
            }

        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            try
            {
                psiProcess.Kill();
                psiProcess.Dispose();
            }
            catch
            {
            }
        }
    }
}
