import { ObjectStrategyBaseClass } from '../overlay-controller/abstraction-handlers/object-strategy-base.class';
import { DamagePayload, DamageRequestParams, Damages } from '../typings/damage-controller.typing';
import { isPropEmpty } from '../utils/CommonUtils';

/**
 * A Helper class to generate the payloads and some diff checks to handle like changes / mutation of objects
 */
export class DamagePayloadHandlerClass {
  static getGenerateAddDamagePayload(objectsInstances: ObjectStrategyBaseClass[], segmentInfoPayload?: DamageRequestParams): DamagePayload {
    const mutatedObjects = objectsInstances?.filter((ins) => ins?.getMutation());

    if (mutatedObjects.length === 0) {
      return null;
    }

    const localObjects = mutatedObjects.filter((ins) => isPropEmpty(ins?.getPristineId()));
    const newDamages: Damages[] = [];

    localObjects?.forEach((lb) => {
      const damage: Damages = {
        id: lb?.getPristineId() ?? null,
        cx: lb?.getNormalizedObjectDim()?.left,
        cy: lb?.getNormalizedObjectDim()?.top,
        width: lb?.getNormalizedObjectDim()?.width,
        height: lb?.getNormalizedObjectDim()?.height,
        confidence: 0,
        class_id: lb?.getClassOrColorCode(),
      };

      newDamages.push(damage);
    });

    if (isPropEmpty(newDamages)) {
      return null;
    }

    const damageRequestParams: DamagePayload = {
      transaction_id: segmentInfoPayload?.transaction_id,
      entity_id: segmentInfoPayload?.entity_id,
      container_number: segmentInfoPayload?.container_number,
      side: segmentInfoPayload?.side,
      segment_id: segmentInfoPayload?.segment_id,
      damages: newDamages,
      side_id: segmentInfoPayload?.side_id,
    };

    return damageRequestParams;
  }

  static getGenerateDeletedDamagePayload(objectsInstances: ObjectStrategyBaseClass[], segmentInfoPayload?: DamageRequestParams): DamagePayload {
    const mutatedObjects = objectsInstances?.filter((ins) => ins?.getMutation());

    if (mutatedObjects.length === 0) {
      return null;
    }

    // We will consider deleted objects only which are fetched from the server , otherwise igonre the local changes objects
    const localObjects = mutatedObjects.filter((ins) => !isPropEmpty(ins?.getPristineId()));
    const newDamages: Damages[] = [];

    localObjects?.forEach((lb) => {
      const damage: Damages = {
        id: lb?.getPristineId() ?? null,
        cx: lb?.getNormalizedObjectDim()?.left,
        cy: lb?.getNormalizedObjectDim()?.top,
        width: lb?.getNormalizedObjectDim()?.width,
        height: lb?.getNormalizedObjectDim()?.height,
        confidence: 0,
        class_id: lb?.getClassOrColorCode(),
      };

      newDamages.push(damage);
    });

    if (isPropEmpty(newDamages)) {
      return null;
    }

    const damageRequestParams: DamagePayload = {
      transaction_id: segmentInfoPayload?.transaction_id,
      entity_id: segmentInfoPayload?.entity_id,
      container_number: segmentInfoPayload?.container_number,
      side: segmentInfoPayload?.side,
      segment_id: segmentInfoPayload?.segment_id,
      damages: newDamages,
      side_id: segmentInfoPayload?.side_id,
    };

    return damageRequestParams;
  }

  static getGenerateUpdatedDamagePayload(objectsInstances: ObjectStrategyBaseClass[], segmentInfoPayload?: DamageRequestParams): DamagePayload {
    const mutatedObjects = objectsInstances?.filter((ins) => ins?.getMutation());

    if (mutatedObjects.length === 0) {
      return null;
    }

    // We will consider Updated objects only which are fetched from the server , otherwise igonre the local changes objects
    const localObjects = mutatedObjects.filter((ins) => !isPropEmpty(ins?.getPristineId() && !ins?.getIsRemoved()));
    const newDamages: Damages[] = [];

    localObjects?.forEach((lb) => {
      const damage: Damages = {
        id: lb?.getPristineId() ?? null,
        cx: lb?.getNormalizedObjectDim()?.left,
        cy: lb?.getNormalizedObjectDim()?.top,
        width: lb?.getNormalizedObjectDim()?.width,
        height: lb?.getNormalizedObjectDim()?.height,
        confidence: 0,
        class_id: lb?.getClassOrColorCode(),
      };

      newDamages.push(damage);
    });

    if (isPropEmpty(newDamages)) {
      return null;
    }

    const damageRequestParams: DamagePayload = {
      transaction_id: segmentInfoPayload?.transaction_id,
      entity_id: segmentInfoPayload?.entity_id,
      container_number: segmentInfoPayload?.container_number,
      side: segmentInfoPayload?.side,
      segment_id: segmentInfoPayload?.segment_id,
      damages: newDamages,
      side_id: segmentInfoPayload?.side_id,
    };

    return damageRequestParams;
  }
}
