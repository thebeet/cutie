import _ from 'lodash';
import * as THREE from 'three';

interface PCDField {
    name: string;
    type: 'F' | 'U' | 'I';
    size: 1 | 2 | 4 | 8;
    value: (geometry: THREE.BufferGeometry, pos: number) => number;
}

const FieldX: PCDField = {
    name: 'x',
    type: 'F',
    size: 4,
    value: (geometry, pos) => geometry.attributes.position.getX(pos)
};

const FieldY: PCDField = {
    name: 'y',
    type: 'F',
    size: 4,
    value: (geometry, pos) => geometry.attributes.position.getY(pos)
};
const FieldZ: PCDField = {
    name: 'z',
    type: 'F',
    size: 4,
    value: (geometry, pos) => geometry.attributes.position.getZ(pos)
};
const FieldLabel: PCDField = {
    name: 'label',
    type: 'I',
    size: 4,
    value: (geometry, pos) => geometry.attributes.label.getZ(pos)
};

const createPcdHeader = (format: string, pointsCount: number, fields: PCDField[]): string => {
    return [
        'VERSION 0.7',
        'FIELDS ' + fields.map(field => field.name).join(' '),
        'SIZE ' + fields.map(field => field.size.toString()).join(' '),
        'TYPE ' + fields.map(field => field.type).join(' '),
        'COUNT ' + fields.map(() => '1').join(' '),
        `WIDTH ${pointsCount}`,
        'HEIGHT 1',
        'VIEWPOINT 0 0 0 1 0 0 0',
        `POINTS ${pointsCount}`,
        `DATA ${format}`,
        ''
    ].join('\n');
};

/**
 * Serializes a THREE.Points object into an ASCII PCD (Point Cloud Data) string.
 * @author XIANG GuangTe
 *
 * @param {THREE.Points} points - The THREE.Points object containing the point cloud geometry.
 * @param {PCDField[]} fields - An array of field descriptors defining the structure and types of the point data.
 * @returns {string} A string representing the serialized ASCII PCD data, including header and point data.
 */
const dumpAscii = (points: THREE.Points, fields: PCDField[]) => {
    const geometry = points.geometry;
    const pointCount = points.geometry.attributes.position.count;
    const header = createPcdHeader('ascii', pointCount, fields);
    const buffer = _.range(0, pointCount).map(i => fields.map(field => field.value(geometry, i)).join(' ')).join('\n');
    return header + buffer;
};

/**
 * Serializes a THREE.Points object into a binary PCD (Point Cloud Data) buffer.
 * @author XIANG GuangTe
 *
 * @param {THREE.Points} points - The THREE.Points object containing the point cloud geometry.
 * @param {PCDField[]} fields - An array of field descriptors defining the structure and types of the point data.
 * @returns {ArrayBuffer} An ArrayBuffer representing the serialized binary PCD data, including header and point data.
 */
const dumpBinary = (points: THREE.Points, fields: PCDField[]) => {
    const geometry = points.geometry;
    const pointCount = points.geometry.attributes.position.count;
    const header = createPcdHeader('binary', pointCount, fields);
    const pointBufferSize = fields.reduce((acc, field) => acc + field.size, 0);

    const offsets = new WeakMap<PCDField, number>();
    let offset = 0;
    for (const field of fields) {
        offsets.set(field, offset);
        offset += field.size;
    }

    const headerBuffer = new TextEncoder().encode(header);

    const buffer = new ArrayBuffer(headerBuffer.byteLength + pointBufferSize * pointCount);
    new Uint8Array(buffer).set(headerBuffer);
    const bufferView = new DataView(buffer, headerBuffer.byteLength);

    for (let i = 0; i < pointCount; i++) {
        for (const field of fields) {
            const value = field.value(geometry, i);
            const offset = offsets.get(field)! + i * pointBufferSize;
            switch (field.type) {
            case 'F':
                if (field.size === 4) {
                    bufferView.setFloat32(offset, value, true);
                } else if (field.size === 8) {
                    bufferView.setFloat64(offset, value, true);
                } else {
                    throw new Error('Unsupported field size: ' + field.size);
                }
                break;
            case 'I':
                if (field.size === 1) {
                    bufferView.setInt8(offset, value);
                } else if (field.size === 2) {
                    bufferView.setInt16(offset, value, true);
                } else if (field.size === 4) {
                    bufferView.setInt32(offset, value, true);
                } else {
                    throw new Error('Unsupported field size: ' + field.size);
                }
                break;
            case 'U':
                if (field.size === 1) {
                    bufferView.setUint8(offset, value);
                } else if (field.size === 2) {
                    bufferView.setUint16(offset, value, true);
                } else if (field.size === 4) {
                    bufferView.setUint32(offset, value, true);
                } else {
                    throw new Error('Unsupported field size: ' + field.size);
                }
                break;
            default:
                throw new Error('Unsupported field type: ' + field.type);
            }
        }
    }
    return buffer;
};

export {
    dumpAscii, dumpBinary,
    type PCDField,
    FieldX, FieldY, FieldZ, FieldLabel,
};