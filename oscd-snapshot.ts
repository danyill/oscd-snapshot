/* eslint-disable import/no-extraneous-dependencies */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

function cloneAttributes(destElement: Element, sourceElement: Element) {
  let attr;
  const attributes = Array.prototype.slice.call(sourceElement.attributes);
  // eslint-disable-next-line no-cond-assign
  while ((attr = attributes.pop())) {
    destElement.setAttribute(attr.nodeName, attr.nodeValue);
  }
}

function snapName(filename: string): string {
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
  docs: Record<string, XMLDocument> = {};

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

    // ensure schema revision and namespace definitions are transferred
    cloneAttributes(snapDoc.documentElement, this.doc.documentElement);
    snapDoc.importNode(this.doc.documentElement, true);

    this.docs[snapName(this.docName)] = snapDoc;
  }
}
