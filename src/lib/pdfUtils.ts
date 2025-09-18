import * as pdfjsLib from 'pdfjs-dist';
import { FontInfo } from '@/components/FontList';

// Set up PDF.js worker - use local worker file from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";

export async function extractFontsFromPDF(file: File): Promise<FontInfo[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const fonts: FontInfo[] = [];
    const fontSet = new Map<string, FontInfo>(); // Use Map to avoid duplicates and store full info
    
    // Iterate through all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      try {
        // Get operator list to find font operations
        const operatorList = await page.getOperatorList();
        
        // Look for font operations in the operator list
        for (let i = 0; i < operatorList.fnArray.length; i++) {
          const fn = operatorList.fnArray[i];
          const args = operatorList.argsArray[i];
          
          // Check for font operations (setFont)
          if (fn === pdfjsLib.OPS.setFont && args && args.length > 0) {
            const fontName = args[0];
            
            // Skip if we've already processed this font
            if (fontSet.has(fontName)) continue;
            
            // Try to get font object from page resources
            try {
              const pageResources = page.objs;
              const commonResources = page.commonObjs;
              
              // Try to get font information
              let fontInfo: FontInfo | null = null;
              
              // Check if font is in page objects
              if (pageResources && pageResources.has && pageResources.has(fontName)) {
                const fontObj = await new Promise<any>((resolve, reject) => {
                  const timeout = setTimeout(() => reject(new Error('Timeout')), 1000);
                  pageResources.get(fontName, (obj: any) => {
                    clearTimeout(timeout);
                    resolve(obj);
                  });
                });
                
                if (fontObj) {
                  fontInfo = {
                    name: fontObj.name || fontName,
                    type: fontObj.type || 'Unknown',
                    subtype: fontObj.subtype,
                    embedded: !!(fontObj.data || fontObj.file || fontObj.stream)
                  };
                }
              }
              
              // Check common objects if not found in page objects
              if (!fontInfo && commonResources && commonResources.has && commonResources.has(fontName)) {
                const fontObj = await new Promise<any>((resolve, reject) => {
                  const timeout = setTimeout(() => reject(new Error('Timeout')), 1000);
                  commonResources.get(fontName, (obj: any) => {
                    clearTimeout(timeout);
                    resolve(obj);
                  });
                });
                
                if (fontObj) {
                  fontInfo = {
                    name: fontObj.name || fontName,
                    type: fontObj.type || 'Unknown',
                    subtype: fontObj.subtype,
                    embedded: !!(fontObj.data || fontObj.file || fontObj.stream)
                  };
                }
              }
              
              // If we couldn't get detailed info, create basic entry
              if (!fontInfo) {
                fontInfo = {
                  name: fontName,
                  type: 'Unknown',
                  embedded: false
                };
              }
              
              fontSet.set(fontName, fontInfo);
              
            } catch (fontError) {
              // If we can't get font details, add basic info
              console.warn(`Could not get details for font ${fontName}:`, fontError);
              fontSet.set(fontName, {
                name: fontName,
                type: 'Unknown',
                embedded: false
              });
            }
          }
        }
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
      }
    }
    
    // Convert Map values to array and sort
    const uniqueFonts = Array.from(fontSet.values());
    
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