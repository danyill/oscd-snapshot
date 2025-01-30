/* eslint-disable import/no-extraneous-dependencies */
import { html, LitElement, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';

import '@material/mwc-snackbar';

import type { Snackbar } from '@material/mwc-snackbar';

function cloneAttributes(destElement: Element, sourceElement: Element) {
  let attr;
  const attributes = Array.prototype.slice.call(sourceElement.attributes);
  // eslint-disable-next-line no-cond-assign
  while ((attr = attributes.pop())) {
    destElement.setAttribute(attr.nodeName, attr.nodeValue);
  }
}

/**
 * Creates a deep copy of an XML document with proper namespace handling
 * @param sourceDoc - The source XML document to copy
 * @param sclNamespace - The root element namespace URI
 * @returns A new XML document that is a copy of the source
 */
function copyDoc(
  sourceDoc: XMLDocument,
  sclNamespace: string = 'http://www.iec.ch/61850/2003/SCL',
): XMLDocument | undefined {
  const newDoc = document.implementation.createDocument(
    sclNamespace,
    'SCL',
    null,
  );

  const processingInstruction = newDoc.createProcessingInstruction(
    'xml',
    'version="1.0" encoding="UTF-8"',
  );
  newDoc.insertBefore(processingInstruction, newDoc.firstChild);

  if (sourceDoc.documentElement) {
    cloneAttributes(newDoc.documentElement, sourceDoc.documentElement);
    const importedNode = newDoc.importNode(sourceDoc.documentElement, true);
    if (newDoc.documentElement) {
      newDoc.replaceChild(importedNode, newDoc.documentElement);
    }

    return newDoc;
  }
  return undefined;
}

function snapshotName(filename: string): string {
  // Get current date and format it
  const now: Date = new Date();
  const timestamp: string = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(
    now.getHours(),
  ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(
    now.getSeconds(),
  ).padStart(2, '0')}`;

  // Find last occurrence of dot to locate extension
  const lastDotIndex: number = filename.lastIndexOf('.');

  // If no extension found, append timestamp to end
  if (lastDotIndex === -1) {
    return `${filename}_${timestamp}`;
  }

  // Insert timestamp before extension
  const nameWithoutExt: string = filename.slice(0, lastDotIndex);
  const extension: string = filename.slice(lastDotIndex);
  return `${nameWithoutExt}_${timestamp}${extension}`;
}

/** An editor [[`plugin`]] to create a snapshot of the currently open SCL file */
export default class SnapshotPlugin extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property()
  doc!: XMLDocument;

  @property()
  docName!: string;

  @property()
  userMessage: string = '';

  @property()
  docs: Record<string, XMLDocument> = {};

  @query('#userMessage') userMessageUI?: Snackbar;

  async run() {
    const sclNamespace = 'http://www.iec.ch/61850/2003/SCL';
    const snapDoc = document.implementation.createDocument(
      sclNamespace,
      'SCL',
      null,
    );
    const pi = snapDoc.createProcessingInstruction(
      'xml',
      'version="1.0" encoding="UTF-8"',
    );
    snapDoc.insertBefore(pi, snapDoc.firstChild);

    const snapName = snapshotName(this.docName);
    const newDoc = copyDoc(this.doc);

    if (newDoc) {
      this.docs[snapName] = newDoc;
      this.userMessage = `Snapshot created: ${snapName}`;
    } else {
      this.userMessage = `Unable to take snapshot of ${this.docName}`;
    }
    if (this.userMessageUI) this.userMessageUI!.show();
  }

  render(): TemplateResult {
    return html`
      <mwc-snackbar
        id="userMessage"
        labelText="${this.userMessage}"
      ></mwc-snackbar>
    `;
  }
}
