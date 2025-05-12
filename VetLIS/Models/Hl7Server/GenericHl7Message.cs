namespace VetLIS.Models.Hl7Server
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.RegularExpressions;

    public class GenericHl7Message
    {
        private string[] segments;
        private string message;
        private char fieldDelimiter;
        private char componentDelimiter;
        private char subComponentDelimiter;
        private char repeatDelimiter;

        public GenericHl7Message(string messageString)
        {
            this.message = messageString.Trim('\n', '\r');
            this.segments = messageString.Split((char)0x0D, StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim('\n', '\r')).ToArray();

            // set the field, component, sub component and repeat delimiters
            int startPos = this.message.IndexOf("MSH");
            if (startPos >= 0)
            {
                startPos = startPos + 2;
                this.fieldDelimiter = this.message[startPos + 1];
                this.componentDelimiter = this.message[startPos + 2];
                this.repeatDelimiter = this.message[startPos + 3];
                this.subComponentDelimiter = this.message[startPos + 5];
            }
            else
            {
                // throw an exception if a MSH segment is not included in the message. 
                throw new ArgumentException("MSH segment not present.");
            }
        }

        public char FieldDelimiter
        {
            get { return this.fieldDelimiter; }
        }

        public char ComponentDelimiter
        {
            get { return this.componentDelimiter; }
        }

        public char SubcomponentDelimiter
        {
            get { return this.subComponentDelimiter; }
        }

        public char RepeatDelimiter
        {
            get { return this.repeatDelimiter; }
        }

        public override string ToString()
        {
            return this.message;
        }

        public string[]? GetHL7Item(string hl7LocationString)
        {
            string segmentName;
            uint fieldNumber;
            uint componentNumber;
            uint subcomponentNumber;
            uint segmentRepeatNumber;
            uint fieldRepeatNumber;

            if (this.GetElementPosition(hl7LocationString, out segmentName, out segmentRepeatNumber, out fieldNumber, out fieldRepeatNumber, out componentNumber, out subcomponentNumber)) // GetElement position return null if the string is not formatted correctly
            {
                if (subcomponentNumber != 0) // segment, field, component and sub component
                {
                    return this.GetValue(segmentName, fieldNumber, componentNumber, subcomponentNumber, segmentRepeatNumber, fieldRepeatNumber);
                }
                else if (componentNumber != 0) // segment, field and component
                {
                    return this.GetValue(segmentName, fieldNumber, componentNumber, segmentRepeatNumber, fieldRepeatNumber);
                }
                else if (fieldNumber != 0) // segment and field
                {
                    return this.GetValue(segmentName, fieldNumber, segmentRepeatNumber, fieldRepeatNumber);
                }
                else if (segmentName != null) // segment only
                {
                    return this.GetValue(segmentName, segmentRepeatNumber);
                }
                else // this should be redundant, if a value was returned from GetElementPosition it would match one of the earlier if / else if statements.
                {
                    return null;
                }
            }
            else // the user did not provide a valid string identifying a HL7 element
            {
                return null;
            }
        }

        private string[] GetValue(string segmentID, uint segmentRepeatNumber)
        {
            List<string> segmentsToReturn = new List<string>();
            uint numberOfSegments = 0;

            foreach (string currentLine in this.segments)
            {
                if (Regex.IsMatch(currentLine, "^" + segmentID, RegexOptions.IgnoreCase)) //search for the segment ID at the start of a line.
                {
                    numberOfSegments++;

                    // if a SegmentRepeatNumber is provided, only add a segment for this specific repeat. Keep cound of the number of segments found.
                    if (segmentRepeatNumber > 0)
                    {
                        if (segmentRepeatNumber == numberOfSegments)
                        {
                            segmentsToReturn.Add(currentLine);
                            return segmentsToReturn.ToArray(); // return immediately, only one segment returned if user specifies a particular segment repeat.
                        }
                    }
                    else
                    {
                        // add all repeats if SegmentRepeatNumber = 0 (ie not provided).
                        segmentsToReturn.Add(currentLine);
                    }
                }
            }

            return segmentsToReturn.ToArray();
        }

        private string[] GetValue(string segmentID, uint fieldID, uint segmentRepeatNumber, uint fieldRepeatNumber)
        {
            List<string> fieldsToReturn = new List<string>();
            string[] fields;
            string[] repeatingFields;

            // get the segment requested
            string[] segments = GetValue(segmentID, segmentRepeatNumber);

            // from the segments returned above, look for the fields requested
            if (segmentID.ToUpper() == "MSH") // MSH segments are a special case, due to MSH-1 being the field delimiter character itself.
            {
                fieldID = fieldID - 1; // when splitting MSH segments, MSH-1 is the character used in the split, so field numbers won't match the array position of the split segments as is the case with all other segments.
                if (fieldID == 0) // ie MSH-1
                {
                    fieldsToReturn.Add(this.fieldDelimiter.ToString()); // return the field delimiter if looking for MSH-1
                    return fieldsToReturn.ToArray();
                }

                if (fieldID == 1) // i.e MSH-2
                {
                    if (segments.Length > 0) // make sure a MSH segment was found, otherwise an array out of bound exception would be thrown.
                    {
                        fieldsToReturn.Add(segments[0].ToString().Substring(4, 4)); // special case for MSH-2 as this field contains the repeat delimiter. If this is not handled here, the field would be incorrectly treated as a repeating field.
                        return fieldsToReturn.ToArray();
                    }
                }
            }

            // for all segments, return the field(s) requested.
            for (int i = 0; i < segments.Count(); i++)
            {
                string currentField;
                fields = segments[i].Split(this.fieldDelimiter);
                if (fieldID < fields.Length)
                {
                    if (fields[fieldID].Contains(this.repeatDelimiter.ToString()))
                    {
                        repeatingFields = fields[fieldID].Split(this.repeatDelimiter);
                        for (uint j = 0; j < repeatingFields.Count(); j++)
                        {
                            currentField = repeatingFields[j];

                            // if the user has specified a specific field repeat, only return that field.
                            if (fieldRepeatNumber > 0)
                            {
                                if (fieldRepeatNumber == j + 1)
                                {
                                    fieldsToReturn.Add(currentField);
                                    return fieldsToReturn.ToArray();
                                }
                            }
                            else
                            {
                                // else return all of the repeating fields
                                fieldsToReturn.Add(currentField);
                            }
                        }
                    }
                    else
                    {
                        // no repeats detected, so add the single field to return
                        if (fieldRepeatNumber <= 1) // since no repeats found, only return a value if user did not specify a specific repeat, or asked for repeat 1. If the user asked for repeats other than the first, nothing will be returned.
                        {
                            fieldsToReturn.Add(fields[fieldID]);
                        }
                    }
                }
            }

            return fieldsToReturn.ToArray();
        }

        private string[] GetValue(string segmentID, uint fieldID, uint componentID, uint segmentRepeatNumber, uint fieldRepeatNumber)
        {
            List<string> componentsToReturn = new List<string>();
            string[] components;

            // get the field requested
            string[] fields = this.GetValue(segmentID, fieldID, segmentRepeatNumber, fieldRepeatNumber);

            // from the list of fields returned, look for the component requested.
            for (int i = 0; i < fields.Count(); i++)
            {
                components = fields[i].Split(this.componentDelimiter);
                if ((components.Count() >= componentID) && (components.Count() > 1))
                {
                    componentsToReturn.Add(components[componentID - 1]);
                }
            }

            return componentsToReturn.ToArray();
        }

        private string[] GetValue(string segmentID, uint fieldID, uint componentID, uint subComponentID, uint segmentRepeatNumber, uint fieldRepeatNumber)
        {
            List<string> subComponentsToReturn = new List<string>();
            string[] subComponents;

            // get the component requested
            string[] components = this.GetValue(segmentID, fieldID, componentID, segmentRepeatNumber, fieldRepeatNumber);

            // from the component(s) returned above look for the subcomponent requested
            for (int i = 0; i < components.Count(); i++)
            {
                subComponents = components[i].Split(this.subComponentDelimiter);
                if ((subComponents.Count() >= subComponentID) && (subComponents.Count() > 1)) // make sure the subComponentID requested exists in the array before requesting it. 
                {
                    subComponentsToReturn.Add(subComponents[subComponentID - 1]);
                }
            }

            return subComponentsToReturn.ToArray();
        }

        private bool GetElementPosition(string hl7LocationString, out string segment, out uint segmentRepeat, out uint field, out uint fieldRepeat, out uint component, out uint subComponent)
        {
            string[] tempString;
            string[] tempString2;

            // set all out values to return to negative results, only set values if  found in HL7LocationString
            segment = null;
            field = 0;
            component = 0;
            subComponent = 0;
            segmentRepeat = 0;
            fieldRepeat = 0;

            // use regular expressions to determine what filter was provided
            if (Regex.IsMatch(hl7LocationString, "^[A-Z]{2}([A-Z]|[0-9])([[]([1-9]|[1-9][0-9])[]])?(([-][0-9]{1,3}([[]([1-9]|[1-9][0-9])[]])?[.][0-9]{1,3}[.][0-9]{1,3})|([-][0-9]{1,3}([[]([1-9]|[1-9][0-9])[]])?[.][0-9]{1,3})|([-][0-9]{1,3}([[]([1-9]|[1-9][0-9])[]])?))?$", RegexOptions.IgnoreCase)) // segment([repeat])? or segment([repeat)?-field([repeat])? or segment([repeat)?-field([repeat])?.component or segment([repeat)?-field([repeat])?.component.subcomponent 
            {
                // check to see if a segment repeat number is specified
                Match checkRepeatingSegmentNumber = System.Text.RegularExpressions.Regex.Match(hl7LocationString, "^[A-Z]{2}([A-Z]|[0-9])[[][1-9]{1,3}[]]", RegexOptions.IgnoreCase);
                if (checkRepeatingSegmentNumber.Success == true)
                {
                    string tmpStr = checkRepeatingSegmentNumber.Value.Split('[')[1];
                    segmentRepeat = uint.Parse(tmpStr.Split(']')[0]);
                }

                // check to see if a field repeat number is specified
                Match checkRepeatingFieldNumber = System.Text.RegularExpressions.Regex.Match(hl7LocationString, "[-][0-9]{1,3}[[]([1-9]|[1-9][0-9])[]]", RegexOptions.IgnoreCase);
                if (checkRepeatingFieldNumber.Success == true)
                {
                    string tmpStr = checkRepeatingFieldNumber.Value.Split('[')[1];
                    fieldRepeat = uint.Parse(tmpStr.Split(']')[0]);
                }

                // retrieve the field, component and subcomponent values. If they don't exist, set to 0
                tempString = hl7LocationString.Split('-');
                segment = tempString[0].Substring(0, 3); // the segment name
                if (tempString.Count() > 1) // confirm values other than the segment were provided.
                {
                    tempString2 = tempString[1].Split('.');
                    if (tempString2.Count() >= 1) // field exists, possibly more. Set the field value.
                    {
                        field = uint.Parse(tempString2[0].Split('[')[0]); // if the field contains a repeat number, ignore the repeat value and braces
                    }

                    if (tempString2.Count() >= 2) // field and component, possibly more. Set the component value
                    {
                        component = uint.Parse(tempString2[1]);
                    }

                    if (tempString2.Count() == 3) // field, component and sub component exist. Set the value of the subcomponent.
                    {
                        subComponent = uint.Parse(tempString2[2]);
                    }
                }

                return true;
            }
            else // no valid HL7 element string detected.
            {
                return false;
            }
        }

        public string GetMessageTrigger()
        {
            return this.GetHL7Item("MSH-9.1")[0] + "^" + this.GetHL7Item("MSH-9.2")[0];
        }
    }
}
