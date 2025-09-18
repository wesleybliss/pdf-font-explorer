import * as pdfjsLib from 'pdfjs-dist';
import { FontInfo } from '@/components/FontList';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractFontsFromPDF(file: File): Promise<FontInfo[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const fonts: FontInfo[] = [];
    const fontSet = new Set<string>(); // To avoid duplicates
    
    // Iterate through all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const operatorList = await page.getOperatorList();
      
      // Get font resources from the page
      const pageDict = page.objs;
      const resources = page.commonObjs;
      
      // Extract fonts from operator list
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const fn = operatorList.fnArray[i];
        const args = operatorList.argsArray[i];
        
        // Check for font operations
        if (fn === pdfjsLib.OPS.setFont) {
          const fontName = args[0];
          
          // Skip if we've already processed this font
          if (fontSet.has(fontName)) continue;
          fontSet.add(fontName);
          
          try {
            // Try to get font information
            const fontObj = await new Promise<any>((resolve, reject) => {
              // Check page objects first
              if (pageDict.has(fontName)) {
                pageDict.get(fontName, resolve);
              } else if (resources.has(fontName)) {
                resources.get(fontName, resolve);
              } else {
                // If not found in objects, create a basic entry
                resolve({ name: fontName, data: null });
              }
            });
            
            if (fontObj) {
              // Extract font information
              const fontInfo: FontInfo = {
                name: fontObj.name || fontName,
                type: fontObj.type || 'Unknown',
                subtype: fontObj.subtype,
                embedded: !!(fontObj.data || fontObj.file)
              };
              
              fonts.push(fontInfo);
            }
          } catch (err) {
            // If we can't get detailed info, add basic info
            fonts.push({
              name: fontName,
              type: 'Unknown',
              embedded: false
            });
          }
        }
      }
    }
    
    // Also try to get fonts from PDF metadata
    try {
      const metadata = await pdf.getMetadata();
      // Additional font extraction from metadata if available
    } catch (err) {
      console.warn('Could not extract metadata:', err);
    }
    
    // Remove duplicates based on name and sort
    const uniqueFonts = fonts.filter((font, index, self) => 
      index === self.findIndex(f => f.name === font.name)
    );
    
    return uniqueFonts.sort((a, b) => {
      // Sort embedded fonts first, then alphabetically
      if (a.embedded !== b.embedded) {
        return a.embedded ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
  } catch (error) {
    console.error('Error extracting fonts from PDF:', error);
    throw new Error('Failed to extract fonts from PDF. Please ensure the file is a valid PDF.');
  }
}