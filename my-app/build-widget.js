const path = require('path');
const fs = require('fs');

// Create a script that builds the widget
function buildWidgetScript() {
  // Create web directory if it doesn't exist
  const webDir = path.join(__dirname, 'web');
  if (!fs.existsSync(webDir)) {
    fs.mkdirSync(webDir);
  }

  // Copy the widget.js file
  const widgetSourcePath = path.join(__dirname, 'web', 'widget.js');
  const widgetDistPath = path.join(__dirname, 'web', 'dist', 'napier-widget.min.js');
  
  // Create dist directory if it doesn't exist
  const distDir = path.join(__dirname, 'web', 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }
  
  // Read widget.js content
  const widgetContent = fs.readFileSync(widgetSourcePath, 'utf8');
  
  // In a real scenario, you would minify the code here
  // For simplicity, we'll just copy it as is
  fs.writeFileSync(widgetDistPath, widgetContent, 'utf8');
  
  console.log('Widget built successfully!');
  console.log(`Widget available at: ${widgetDistPath}`);
}

buildWidgetScript();