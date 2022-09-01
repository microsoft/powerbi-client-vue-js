// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { service, Embed } from 'powerbi-client';

import packageInfo from '../../package.json';

export type EventHandler = (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null;

/**
 * Compare the two maps.
 *
 * @param oldMap Map of event and corresponding handler method
 * @param newMap Map of event and corresponding handler method
 *
 */
export function areMapsSame(oldMap: Map<string, EventHandler>, newMap: Map<string, EventHandler>): boolean {
  if (oldMap.size !== newMap.size) {
    return false;
  }

  for (const [key, oldVal] of oldMap) {
    // Check the key is present in newMap
    if(!newMap.has(key)) {
      return false;
    }
    const newVal = newMap.get(key);

    // Stringify the values from both maps and compare
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      return false;
    }
  }
  return true;
}

// SDK information to be used with service instance
export const SdkType = "powerbi-client-vue-js";
export const SdkWrapperVersion: string = packageInfo.version;