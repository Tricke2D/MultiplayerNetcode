import { integrateMotion } from '../rigid-body';
import { createEntity } from '../../state/entity.model';
describe('integrateMotion ? determinism', () => {
    it('menghasilkan posisi akhir yang identik untuk input yang sama', () => {
        const entityA = createEntity('a');
        entityA.velocity = { x: 5, y: 0 };
        const entityB = createEntity('a');
        entityB.velocity = { x: 5, y: 0 };
        for (let i = 0; i < 10; i += 1) {
            integrateMotion(entityA, 1 / 30);
            integrateMotion(entityB, 1 / 30);
        }
        expect(entityA.position).toEqual(entityB.position);
    });
});
