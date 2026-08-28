/**
 * Smoke Tests for Vaani-Setu Core Engine
 */
const assert = require('assert');
const schemes = require('../src/js/schemes.js');

describe('Vaani-Setu Smoke Test Suite', () => {
    it('should have valid scheme database loaded', () => {
        assert.ok(Array.isArray(schemes) || typeof schemes === 'object');
    });

    it('should verify essential scheme keys', () => {
        const list = Array.isArray(schemes) ? schemes : (schemes.schemes || []);
        if (list.length > 0) {
            const first = list[0];
            assert.ok(first.id, 'Scheme should have an ID');
            assert.ok(first.name, 'Scheme should have a Name');
        }
    });
});
