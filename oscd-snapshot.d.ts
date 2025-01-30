import { LitElement } from 'lit';
/** An editor [[`plugin`]] to create a snapshot of the currently open SCL file */
export default class SnapshotPlugin extends LitElement {
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    docName: string;
    docs: Record<string, XMLDocument>;
    run(): Promise<void>;
}
