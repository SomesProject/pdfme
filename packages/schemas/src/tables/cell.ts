import {
  DEFAULT_FONT_NAME,
  Plugin,
  PDFRenderProps,
  UIRenderProps,
  getFallbackFontName,
} from '@pdfme/common';
import { uiRender as textUiRender } from '../text/uiRender.js';
import { pdfRender as textPdfRender } from '../text/pdfRender.js';
import imageSchema from '../graphics/image.js';
import line from '../shapes/line.js';
import { rectangle } from '../shapes/rectAndEllipse.js';
import type { CellSchema } from './types';
import { getCellPropPanelSchema, getDefaultCellStyles } from './helper.js';

const linePdfRender = line.pdf;
const rectanglePdfRender = rectangle.pdf;

const delimiter = "@@@";
const imageFallback = 'data:image/png;base64,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';

const renderLine = async (
  arg: PDFRenderProps<CellSchema>,
  schema: CellSchema,
  position: { x: number; y: number },
  width: number,
  height: number
) =>
  linePdfRender({
    ...arg,
    schema: { ...schema, type: 'line', position, width, height, color: schema.borderColor },
  });

function getImageDimensions(base64: any): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = (error) => {
      reject(new Error("Failed to load the image."));
    };

    img.src = base64;
  });
}

const createTextDiv = (schema: CellSchema) => {
  const { borderWidth: bw, width, height, padding: pd } = schema;
  const textDiv = document.createElement('div');
  textDiv.style.position = 'absolute';
  textDiv.style.zIndex = '1';
  textDiv.style.width = `${width - bw.left - bw.right - pd.left - pd.right}mm`;
  textDiv.style.height = `${height - bw.top - bw.bottom - pd.top - pd.bottom}mm`;
  textDiv.style.top = `${bw.top + pd.top}mm`;
  textDiv.style.left = `${bw.left + pd.left}mm`;
  return textDiv;
};

const createImageDiv = (schema: CellSchema) => {
  const imageDiv = document.createElement('div');
  imageDiv.style.zIndex = '1';
  imageDiv.style.width = '40%';
  imageDiv.style.height = '90%';
  imageDiv.style.position = 'absolute'; // Ensure it is positioned relative to its nearest positioned ancestor
  imageDiv.style.top = '0';            // Position the div at the top
  imageDiv.style.left = '0';           // Position the div to the left side
  imageDiv.style.margin = '0';         // No extra margin
  imageDiv.style.padding = '5px';        // No extra padding
  imageDiv.style.borderRadius = '0px';
  imageDiv.style.boxSizing = 'border-box'; // Include padding and border in the element's total width and height
  imageDiv.style.display = 'flex';
  imageDiv.style.justifyContent = 'flex-start'; // Align children horizontally to the left
  imageDiv.style.alignItems = 'center'; 
  return imageDiv;
}

const createLineDiv = (
  width: string,
  height: string,
  top: string | null,
  right: string | null,
  bottom: string | null,
  left: string | null,
  borderColor: string
) => {
  const div = document.createElement('div');
  div.style.width = width;
  div.style.height = height;
  div.style.position = 'absolute';
  if (top !== null) div.style.top = top;
  if (right !== null) div.style.right = right;
  if (bottom !== null) div.style.bottom = bottom;
  if (left !== null) div.style.left = left;
  div.style.backgroundColor = borderColor;
  return div;
};

const undefinedPlaceholder = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

async function getImageAsDataURL(imageUrl: string) {
  if (!imageUrl || imageUrl === 'undefined' || imageUrl === undefinedPlaceholder) {
    return imageFallback;
  }

  try {
    if (typeof window !== 'undefined') {
      // Fetch the image as a Blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert the Blob to a Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // This will be the data URL
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Node.js environment
      const nodeFetch = await import('node-fetch');
      const response = await nodeFetch.default(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = response.headers.get('content-type');
      if (!mimeType) {
        throw new Error('Unable to determine MIME type');
      }
      const base64String = buffer.toString('base64');
      return `data:${mimeType};base64,${base64String}`;
    }
  } catch (error) {
    console.error('Error fetching the image:', error);
    return null;
  }
}

const cellSchema: Plugin<CellSchema> = {
  pdf: async (arg: PDFRenderProps<CellSchema>) => {
    const { schema } = arg;

    const { position, width, height, borderWidth, padding } = schema;
    let imagewidth = 0;
    let imageHeight = 0;
    let imageUrl = undefined;

    if (arg?.value && arg?.value.includes(delimiter)) {
      const parts = arg?.value.split(delimiter);
      if (parts?.length === 2) { 
        imageUrl = parts[0];
        arg.value = parts[1];
      }
    }

    await Promise.all([
      // BACKGROUND
      rectanglePdfRender({
        ...arg,
        schema: {
          ...schema,
          type: 'rectangle',
          width: schema.width,
          height: schema.height,
          borderWidth: 0,
          borderColor: '',
          color: schema.backgroundColor,
        },
      }),
      // TOP
      renderLine(arg, schema, { x: position.x, y: position.y }, width, borderWidth.top),
      // RIGHT
      renderLine(
        arg,
        schema,
        { x: position.x + width - borderWidth.right, y: position.y },
        borderWidth.right,
        height
      ),
      // BOTTOM
      renderLine(
        arg,
        schema,
        { x: position.x, y: position.y + height - borderWidth.bottom },
        width,
        borderWidth.bottom
      ),
      // LEFT
      renderLine(arg, schema, { x: position.x, y: position.y }, borderWidth.left, height),
    ]);

    if (imageUrl) {
      let dataUrl = await getImageAsDataURL(imageUrl); 
      if (!dataUrl || typeof dataUrl !== 'string') {
        dataUrl = imageFallback;
      }
      
      imagewidth = width * 0.3;
      imageHeight = height * 0.8;
      await imageSchema.pdf({
        ...arg,
        value: dataUrl as string,
        schema: {
          ...schema,
          type: 'image',
          position: {
            x: position.x,
            y: position.y + borderWidth.top + padding.top,
          },
          width: imagewidth,
          height: imageHeight,
          imageUrl,
        },
      });
    }

    await textPdfRender({
      ...arg,
      schema: {
        ...schema,
        type: 'text',
        backgroundColor: '',
        position: {
          x: position.x + borderWidth.left + padding.left + imagewidth,
          y: position.y + borderWidth.top + padding.top,
        },
        width: width - borderWidth.left - borderWidth.right - padding.left - padding.right,
        height: height - borderWidth.top - borderWidth.bottom - padding.top - padding.bottom,
      },
    });

  },
  ui: async (arg: UIRenderProps<CellSchema>) => {
    const { schema, rootElement } = arg;
    const { borderWidth, width, height, borderColor, backgroundColor, padding } = schema;
    rootElement.style.backgroundColor = backgroundColor;
    const textDiv = createTextDiv(schema);

    let imageUrl = undefined;
    let imageDiv = undefined;
    if (arg?.value && arg?.value.includes(delimiter)) {
      const parts = arg?.value.split(delimiter);
      if (parts?.length === 2) { 
        imageUrl = parts[0];
        arg.value = parts[1];
      }
    }

    if (imageUrl) {
      let dataUrl = await getImageAsDataURL(imageUrl); 
      if (!dataUrl || typeof dataUrl !== 'string') {
        dataUrl = imageFallback;
      }

      textDiv.style.left = `${borderWidth.left + padding.left + width * 0.3}mm`;

      imageDiv = createImageDiv(schema);
      await imageSchema.ui({
        ...arg,
        value: dataUrl as string,
        schema: {
          ...schema,
          type: 'image',
          imageUrl,
          readOnly: true,
        },

        rootElement: imageDiv,
      });
    }

    await textUiRender({
      ...arg,
      schema: {
        ...schema,
        type: 'text',
      },
      rootElement: textDiv,
    });
    if (imageDiv) {
      rootElement.appendChild(imageDiv);
    } 
    rootElement.appendChild(textDiv);

    const lines = [
      createLineDiv(`${width}mm`, `${borderWidth.top}mm`, '0mm', null, null, '0mm', borderColor),
      createLineDiv(`${width}mm`, `${borderWidth.bottom}mm`, null, null, '0mm', '0mm', borderColor),
      createLineDiv(`${borderWidth.left}mm`, `${height}mm`, '0mm', null, null, '0mm', borderColor),
      createLineDiv(`${borderWidth.right}mm`, `${height}mm`, '0mm', '0mm', null, null, borderColor),
    ];

    lines.forEach((line) => rootElement.appendChild(line));
  },
  propPanel: {
    schema: ({ options, i18n }) => {
      const font = options.font || { [DEFAULT_FONT_NAME]: { data: '', fallback: true } };
      const fontNames = Object.keys(font);
      const fallbackFontName = getFallbackFontName(font);
      return getCellPropPanelSchema({ i18n, fontNames, fallbackFontName });
    },
    defaultSchema: {
      name: '',
      type: 'cell',
      content: 'Type Something...',
      position: { x: 0, y: 0 },
      width: 50,
      height: 15,
      ...getDefaultCellStyles(),
    },
  },
};
export default cellSchema;
