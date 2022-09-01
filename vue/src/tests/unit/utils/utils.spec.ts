// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '../crypto.mock';
import { EventHandler, areMapsSame} from '../../../utils/utils';

describe('tests of Utils', () => {
  describe('tests PowerBIEmbed compareMap method', () => {

    const eventHandlerMap = new Map<string, EventHandler>([
      ['loaded', () => console.log('Report loaded')],
      ['rendered', () => console.log('Rendered')],
      ['error', () => console.log('error')]
    ]);
    const updatedEventHandlerMap = new Map<string, EventHandler>([
      ['error', () => console.log('error')],
      ['loaded', () => console.log('Report loaded')],
      ['rendered', () => console.log('Rendered')]
    ]);
    const newEventHandlerMap = new Map<string, EventHandler>([
      ['error', () => console.log('error')],
      ['rendered', () => console.log('Rendered')]
    ]);

    it('compares similar event handler map', () => {
      // Act
      const isSameMap = areMapsSame(eventHandlerMap, eventHandlerMap);

      // Assert
      expect(isSameMap).toBeTruthy();
    });

    it('compares the similar event handler map with different order', () => {
      // Act
      const isSameMap = areMapsSame(eventHandlerMap, updatedEventHandlerMap);

      // Assert
      expect(isSameMap).toBeTruthy();
    });

    it('compares the different event handler map', () => {
      // Act
      const isSameMap = areMapsSame(eventHandlerMap, newEventHandlerMap);

      // Assert
      expect(isSameMap).toBeFalsy();
    });
  });
});