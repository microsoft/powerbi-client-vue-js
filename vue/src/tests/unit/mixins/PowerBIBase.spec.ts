// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '../crypto.mock';
import { mount, enableAutoUnmount } from '@vue/test-utils';

import PowerBIBase from '../../../mixins/PowerBIBase';

enableAutoUnmount(afterEach);

describe('PowerBIBase', () => {
  it('should create', () => {
    // Arrange
    const wrapper = mount(PowerBIBase);

    // Assert
    expect(wrapper).toBeTruthy();
  });
});