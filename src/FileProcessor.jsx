import React from 'react';
import { Box, Typography, TextField, Button, Tabs, Tab, TextareaAutosize, Paper, Grid, Container, AppBar, Toolbar } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import BoltIcon from '@mui/icons-material/Bolt';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7e57c2', // Deeper purple
    },
    secondary: {
      main: '#64b5f6', // Brighter blue
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 400,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(45deg, #673ab7 30%, #3f51b5 90%)', // Purple to Blue gradient
          borderRadius: 8,
          color: 'white',
          padding: '10px 25px',
          '&:hover': {
            backgroundImage: 'linear-gradient(45deg, #512da8 30%, #283593 90%)', // Darker gradient on hover
          },
        },
        containedSecondary: {
          backgroundImage: 'linear-gradient(45deg, #00bcd4 30%, #009688 90%)', // Cyan to Teal gradient
          '&:hover': {
            backgroundImage: 'linear-gradient(45deg, #00acc1 30%, #00796b 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // More pronounced shadow
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#9c27b0', // Vibrant purple for indicator
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          'color': 'rgba(255, 255, 255, 0.7)',
          '&.Mui-selected': {
            color: '#fff',
          },
        },
      },
    },
  },
});

const StyledFileInput = styled('input')({
  display: 'none',
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Create a styled Paper component with gradient border
const GradientPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: '1px', // Add padding to account for the border
  borderRadius: '8px', // Match the border radius of the Paper
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, // Use the button gradient colors
  '& > div': {
    backgroundColor: theme.palette.background.paper, // Inner background color
    borderRadius: '8px', // Match the border radius
    padding: theme.spacing(4), // Add padding to the inner content
  },
}));


function convertText(text) {
  // Replace literal "\n" with newline then remove any remaining "\" characters
  let processedText = text.replace(/\\n/g, "\n");
  return processedText.replace(/\\/g, "");
}

function extractLastBoltArtifact(input) {
  const regex = /<boltArtifact\b[^>]*>([\s\S]*?)<\/boltArtifact>/g;
  let match;
  let lastMatch = null;
  
  while ((match = regex.exec(input)) !== null) {
    lastMatch = match[1];
  }
  
  return lastMatch !== null ? lastMatch.trim() : input;
}

function convertBoltActions(input) {
  // This regex captures two groups (type and optional filePath) and the inner content.
  // It uses a lazy match for the contents between boltAction tags.
  const actionRegex = /<boltAction\s+type="(file|shell)"(?:\s+filePath="([^"]+)")?\s*>([\s\S]*?)<\/boltAction>/g;
  
  let match;
  const outputLines = ['#!/bin/bash', 'set -e']; // add bash shebang & strict mode
  
  while ((match = actionRegex.exec(input)) !== null) {
    const actionType = match[1];
    const filePathAttr = match[2];
    const innerContent = match[3].trim();
  
    if (actionType === 'file') {
      if (!filePathAttr) {
        console.error('Missing filePath attribute for a file action.');
        process.exit(1);
      }

      // Determine directory name from filePathAttr (if it includes folders)
      let dirName = '';
      if (filePathAttr.includes('/')) {
        dirName = filePathAttr.substring(0, filePathAttr.lastIndexOf('/'));
        // Append a command to create the directory, if it does not exist
        outputLines.push(`mkdir -p ${dirName}`);
      }
      
      // Use a here-doc to create the file with the extracted content.
      outputLines.push(`cat << 'EOF' > ${filePathAttr}`);
      outputLines.push(innerContent);
      outputLines.push('EOF');
    } else if (actionType === 'shell') {
      // For shell commands, simply output the command.
      outputLines.push(innerContent);
    }
  }
  
  return  outputLines.join('\n');

  // Write everything to the output script file.
  // fs.writeFileSync(outputScriptPath, outputLines.join('\n'));
}



function FileProcessor() {
  const [tabValue, setTabValue] = React.useState(0);
  const [inputText, setInputText] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [processedScript, setProcessedScript] = React.useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTextChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleProcess = () => {
    if (tabValue === 0 && inputText) {
      // Process text input
      console.log('Processing text:', inputText);
    } else if (tabValue === 1 && selectedFile) {
      // Process file upload
      console.log('Processing file:', selectedFile);
    } else {
      alert('Please paste text or upload a file.');
      return;
    }

    let extractedObject = extractLastBoltArtifact(inputText);
    let strippedText = convertText(extractedObject);
    let bashScript = convertBoltActions(strippedText);
    console.log('Bash Script:', bashScript);
    
    setProcessedScript(bashScript); // Save the generated script to state

    return bashScript;
  };

  // Add this updated implementation for handleDownload
  const handleDownload = () => {
    if (!processedScript) return;

    const blob = new Blob([processedScript], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'restoreBoltProject.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="md">
        <Box sx={{ flexGrow: 1 }} >
          <AppBar position="static" style={{ backgroundColor: "#000120", borderRadius: '0.5rem' }}>
            <Toolbar>
              <BoltIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Bolt Project Restoration
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
      </Container>
      <Container maxWidth="md">
        <GradientPaper elevation={3} sx={{ mt: 4 }}>
          <Box style={{ backgroundColor: '#171732' }}>
            <Typography variant="subtitle1" align="center" paragraph color="text.secondary">
              Easily restore projects from broken Bolt.new chats. Export your chat and paste the file contents or upload the file to generate a bash script that will create all of the files and directories for your app as well as run any of the terminal commands. 
            </Typography>

            <Box sx={{ width: '100%', mt: 4 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="input-tabs" centered>
                <Tab icon={<ArticleIcon />} iconPosition="start" label="Paste Text" {...a11yProps(0)} />
                <Tab icon={<UploadFileIcon />} iconPosition="start" label="Upload File" {...a11yProps(1)} />
              </Tabs>
              <TabPanel value={tabValue} index={0}>
              <TextareaAutosize
                minRows={10}
                placeholder="Paste your text here..."
                style={{
                  width: '100%',
                  backgroundColor: 'rgb(15 15 31)',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}
                value={inputText}
                onChange={handleTextChange}
              />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <label htmlFor="file-upload-button">
                      <StyledFileInput
                        accept="*"
                        id="file-upload-button"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <Button variant="outlined" component="span" color="secondary">
                        Upload File
                      </Button>
                    </label>
                  </Grid>
                  <Grid item>
                    <Typography variant="body1" color="text.secondary">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </Typography>
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" color="secondary" onClick={handleProcess}>
                Process JSON
              </Button>
              <Button variant="contained" color="primary" onClick={handleDownload} disabled={!processedScript}>
                Download Script
              </Button>
            </Box>
          </Box>
        </GradientPaper>

        <Box sx={{ mt: 6, pt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              How to Use
            </Typography>
            <Typography variant="body2" color="text.secondary">

              <ul className='instructions-list'>
                <li><h5>Step 1</h5><strong>Paste Text or Upload File:</strong> Choose the input method and provide your file content. This should be the full contents of your chat export JSON file from bolt.new or bolt.diy.</li>
                <li><h5>Step 2</h5><strong>Process:</strong> Click the "Process" button to analyze your chat history and generate a bash script.</li>
                <li><h5>Step 3</h5><strong>Download Script:</strong> Once processed, the "Download Script" button will be enabled. Click to download the generated bash script.</li>
                <li>
                  <h5>Step 4</h5>
                  <strong>Run Script:</strong> Execute the downloaded bash script in your terminal to recreate your Bolt project.
                  <ul>
                    <li>You will likely need to make the script executable with `chmod +x restoreBoltProject.sh` before running it.</li>
                    <li>Once that is done, you can run the script with `./restoreBoltProject.sh`.</li>
                    <li>Rememeber to place this script in the directory where you want the files before running it.</li>
                  </ul>
                </li>
              </ul>
              <br />
              
            </Typography>
          </Box>

          <Box sx={{ mt: 6, mb: 6 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Use At Your Own Risk
            </Typography>
            <Typography variant="body2" color="text.secondary">

            I take no responsibility for any issues that may arise from using this tool. Use it at your own risk. These are bash scripts that can technically run anything on your machine. This app does not intentionally inject anything malicious, but there could be unforseen errors when processing your content that could result in faulty outputs. Always double check the contens of the download before running the script on your machine.
              
            </Typography>
          </Box>
          
      </Container>
    </ThemeProvider>
  );
}

export default FileProcessor;
