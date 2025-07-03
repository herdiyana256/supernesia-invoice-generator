// Install html2pdf.js for PDF generation
const { exec } = require("child_process")

exec("npm install html2pdf.js", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`)
    return
  }
  console.log(`Stdout: ${stdout}`)
})
