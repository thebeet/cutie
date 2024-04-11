import * as THREE from 'three';
import { TFrame } from '../types';

type PCDFieldSize = 1 | 2 | 4 | 8;
type PCDFieldType = 'F' | 'U' | 'I';

export type PCDFields = {
    name: string[];
    type: PCDFieldType[];
    size: PCDFieldSize[];
    value: (geometry: THREE.BufferGeometry, pos: number, mat: THREE.Matrix4) => number[];
}

type PCDFieldsWithOffset = PCDFields & {
    offset: number[]
}

const _v = new THREE.Vector3();

export const FieldXYZ: PCDFields = {
    name: ['x', 'y', 'z'],
    type: ['F', 'F', 'F'],
    size: [4, 4, 4],
    value: (geometry, pos) => {
        _v.fromBufferAttribute(geometry.attributes.position, pos);
        return [_v.x, _v.y, _v.z];
    }
};

export const FieldLabel: PCDFields = {
    name: ['label'],
    type: ['I'],
    size: [4],
    value: (geometry, pos) => [geometry.attributes.label.getX(pos)]
};

const buildFields = (fields: readonly PCDFields[]): PCDFieldsWithOffset => {
    let _offset = 0;
    return {
        name: fields.flatMap(f => f.name),
        type: fields.flatMap(f => f.type),
        size: fields.flatMap(f => f.size),
        value: (geometry, pos, mat) => fields.flatMap(f => f.value(geometry, pos, mat)),
        offset: fields.flatMap(f => f.size).map(v => {
            _offset += v;
            return _offset - v;
        })
    };
};

const createPcdHeader = (format: string, pointsCount: number, fields: PCDFields): string => {
    return [
        'VERSION 0.7',
        'FIELDS ' + fields.name.join(' '),
        'SIZE ' + fields.size.map(v => v.toString()).join(' '),
        'TYPE ' + fields.type.join(' '),
        'COUNT ' + fields.name.map(() => '1').join(' '),
        `WIDTH ${pointsCount}`,
        'HEIGHT 1',
        'VIEWPOINT 0 0 0 1 0 0 0',
        `POINTS ${pointsCount}`,
        `DATA ${format}`,
        ''
    ].join('\n');
};

export const dumpAscii = (frames: readonly TFrame[], fields: readonly PCDFields[]) => {
    const mergeFields = buildFields(fields);
    const pointCount = frames.reduce((acc, frame) => acc + frame.points!.geometry.attributes.position.count, 0);
    const header = createPcdHeader('ascii', pointCount, mergeFields);
    const buffer = frames.map(frame => {
        const geometry = frame.points!.geometry;
        const c = geometry.attributes.position.count;
        return Array.from({ length: c }).map((_, i) => mergeFields.value(geometry, i, frame.local.matrixWorld).join(' ')).join('\n');
    }).join('\n');
    return header + buffer;
};

export const dumpBinary = (frames: readonly TFrame[], fields: readonly PCDFields[]) => {
    const mergeFields = buildFields(fields);
    const pointCount = frames.reduce((acc, frame) => acc + frame.points!.geometry.attributes.position.count, 0);
    const header = createPcdHeader('binary', pointCount, mergeFields);
    const pointBufferSize = fields.reduce((acc, field) => acc + field.size.reduce((acc, item) => acc + item, 0), 0);

    const headerBuffer = new TextEncoder().encode(header);
    const buffer = new ArrayBuffer(headerBuffer.byteLength + pointBufferSize * pointCount);
    new Uint8Array(buffer).set(headerBuffer);
    const bufferView = new DataView(buffer, headerBuffer.byteLength);

    let frameOffset = 0;
    frames.forEach(frame => {
        const geometry = frame.points!.geometry;
        const c = geometry.attributes.position.count;
        for (let i = 0; i < c; i++) {
            const values = mergeFields.value(geometry, i, frame.local.matrixWorld);
            for (let j = 0; j < values.length; ++j) {
                const value = values[j];
                const offset = frameOffset + mergeFields.offset[j] + i * pointBufferSize;
                dataViewHelper(bufferView, offset, value, mergeFields.type[j], mergeFields.size[j]);
            }
        }
        frameOffset += pointBufferSize * c;
    });

    return buffer;
};

const dataViewHelper = (dataView: DataView, offset: number, value: number, type: PCDFieldType, size: PCDFieldSize) => {
    switch (type) {
    case 'F':
        if (size === 4) {
            dataView.setFloat32(offset, value, true);
        } else if (size === 8) {
            dataView.setFloat64(offset, value, true);
        } else {
            throw new Error(`Unsupported field size for type[${type}] ${size}`);
        }
        break;
    case 'I':
        if (size === 1) {
            dataView.setInt8(offset, value);
        } else if (size === 2) {
            dataView.setInt16(offset, value, true);
        } else if (size === 4) {
            dataView.setInt32(offset, value, true);
        } else {
            throw new Error(`Unsupported field size for type[${type}] ${size}`);
        }
        break;
    case 'U':
        if (size === 1) {
            dataView.setUint8(offset, value);
        } else if (size === 2) {
            dataView.setUint16(offset, value, true);
        } else if (size === 4) {
            dataView.setUint32(offset, value, true);
        } else {
            throw new Error(`Unsupported field size for type[${type}] ${size}`);
        }
        break;
    default:
        throw new Error('Unsupported field type: ' + type);
    }
};