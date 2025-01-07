/**
 * @description
 * It kind of  an *important class which helps to track the instance and easily can remove instance from the UI.
 */

import { ObjectInstanceType } from "../typings/base-typins";

export abstract class InstanceCollection<T> {
  instanceUUID: string | undefined;
  instanceList: Array<ObjectInstanceType<T>> = [];

  constructor(instanceUUID?: string) {
    this.instanceUUID = instanceUUID;
  }

  // get Instance By UUID
  getInstanceByUUID(uuid: string): ObjectInstanceType<T> | undefined {
    return this.instanceList?.find((ins) => ins?.uuid === uuid);
  }

  // Get Instance By passing the instance identifier
  getInstanceByIdentifier(
    identifier: string
  ): ObjectInstanceType<T> | undefined {
    return this.instanceList?.find(
      (ins) => (ins?.instance as any)?.cid === identifier
    );
  }

  // Get All The Instance UUIDs
  getEnumerateUUIDS(): Array<string | undefined> {
    return this.instanceList?.map((ins) => ins?.uuid);
  }

  // Push Onto the Instance List
  pushInstance(instance: T, id?: string, parentId?: string): void {
    const newUUID = id;

    this.instanceList.push({ instance, uuid: newUUID, parentId });
  }

  // It does not remove from UI but will remove from the Instance List
  dropInstanceByUUID(uuid: string): void {
    const findInstance = this.getInstanceByUUID(uuid);
    this.dropInstance(findInstance);
  }

  // It does remove instance from Instance List and UI as well
  dropInstanceByIdentifier(identifier: string): void {
    const findInstance = this.getInstanceByIdentifier(identifier);
    this.dropInstance(findInstance);
  }

  // Just will drop instance(not from UI)
  dropInstance(instanceCollection: ObjectInstanceType<T> | undefined): void {
    this.instanceList.splice(
      this.instanceList.indexOf(instanceCollection as ObjectInstanceType<T>),
      1
    );
  }

  // Clear All Instances and Remove Objects Instances from UI as well
  clearInstanceCollection(): void {
    this.instanceList = [];
  }
}
