import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Type, Check, X } from 'lucide-react';

export interface FontInfo {
  name: string;
  type: string;
  subtype?: string;
  embedded: boolean;
}

interface FontListProps {
  fonts: FontInfo[];
  isLoading: boolean;
}

export const FontList: React.FC<FontListProps> = ({ fonts, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="h-5 w-5" />
            <span>Analyzing Fonts...</span>
          </CardTitle>
          <CardDescription>
            Extracting font information from PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fonts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="h-5 w-5" />
            <span>Font Analysis</span>
          </CardTitle>
          <CardDescription>
            No fonts found or PDF not analyzed yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const embeddedFonts = fonts.filter(font => font.embedded);
  const nonEmbeddedFonts = fonts.filter(font => !font.embedded);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="h-5 w-5" />
            <span>Font Analysis Results</span>
          </CardTitle>
          <CardDescription>
            Found {fonts.length} fonts total ({embeddedFonts.length} embedded, {nonEmbeddedFonts.length} non-embedded)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Font Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subtype</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fonts.map((font, index) => (
                  <TableRow key={index} className="hover:bg-gradient-tech/30">
                    <TableCell className="font-medium">{font.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{font.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {font.subtype && (
                        <Badge variant="secondary">{font.subtype}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {font.embedded ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Embedded
                            </Badge>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-600" />
                            <Badge variant="destructive">
                              Not Embedded
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {embeddedFonts.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Check className="h-5 w-5" />
              <span>Embedded Fonts ({embeddedFonts.length})</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              These fonts are included in the PDF and will display consistently across all devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {embeddedFonts.map((font, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="font-medium text-green-900">{font.name}</div>
                  <div className="text-sm text-green-700">{font.type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {nonEmbeddedFonts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <X className="h-5 w-5" />
              <span>Non-Embedded Fonts ({nonEmbeddedFonts.length})</span>
            </CardTitle>
            <CardDescription className="text-red-700">
              These fonts rely on system fonts and may display differently across devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nonEmbeddedFonts.map((font, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="font-medium text-red-900">{font.name}</div>
                  <div className="text-sm text-red-700">{font.type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};