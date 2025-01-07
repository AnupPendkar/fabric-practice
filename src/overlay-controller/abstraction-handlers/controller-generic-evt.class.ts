import { FabricObject } from 'fabric';
import { ControllerGenericEventType, RedrawExtras } from '../typings/platform-typings';
import { ObjectStrategyBaseClass } from './object-strategy-base.class';

export class ControllerGenericEventClass<T, K> implements ControllerGenericEventType<T, K> {
  type: K;
  event?: any | FabricObject;
  data?: T;
  extras?: RedrawExtras;
  baseClassInstance?: ObjectStrategyBaseClass;
}
