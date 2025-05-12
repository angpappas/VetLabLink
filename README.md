# VetLab Link
VetLab Link is a standalone application that simplifies veterinary lab operations by collecting, managing, and sharing blood, biochemistry, and immunoassay test results. It allows you to connect lab equipment, view results, and generate professional reports for vets and pet owners.

## Which analyzers are supported?

- Woodley InSight V-IA Plus Veterinary Immunoassay Analyzer
- Woodley InSight V-CHEM Veterinary Chemistry Analyzer
- Woodley InSight V3 Plus Veterinary Hematology Analyzer
- Genrui VH30 Hematology Analyzer
- Seamaty SMT-120 Biochemistry Analyzer


## Technical info

### Tech stack
- Backend: ASP.NET .NET core 8.0
- Database: SQLite (EF core)
- Front end: ReactJS w/ TypeScript, Ant Design 4


### How to run:
The app runs as a local Kestrel hosted ASP.NET site. There's also a minimal MLLP implementation to receive HL7 messages from the network. Then the app serves the front end UI.

- Run the backend using Visual Studio
- Run the front end using Visual Studio Code


### VetLabLink project
The VetLabLink Windows Form app is a utility to host the app so that it looks like a real app to end users, instead of displaying a console and opening a browser. You can omit it.


### More info:
https://www.vetlablink.com/


### Download setup:
https://www.vetlablink.com/download
