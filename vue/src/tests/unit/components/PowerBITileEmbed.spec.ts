// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '../crypto.mock';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import {service, factories} from 'powerbi-client';
import PowerBITileEmbed from '../../../components/PowerBITileEmbed';

enableAutoUnmount(afterEach);

describe('PowerBITileEmbed', () => {
  // Basic configuration for tile component with accessToken
  const configWithAccessToken = {
    type: 'tile',
    id: 'fakeTileId',
    dashboardId: 'fakeId',
    embedUrl: 'fakeUrl',
    accessToken: 'fakeToken',
  };

  // Basic configuration for tile component without accessToken
  const configWithoutAccessToken = {
    type: 'tile',
    id: 'fakeTileId',
    embedUrl: 'fakeUrl',
    dashboardId: 'fakeId',
  };

  describe('Basic tests', () => {
    let wrapper: any = undefined;

    //Basic configuration for tile component
    const basicProps = {
      embedConfig: configWithoutAccessToken,
      cssClassName: 'test',
    };

    beforeEach(() => {
      wrapper = mount(PowerBITileEmbed, {
        props: basicProps
      });
    });

    it('should create', () => {
      // Assert
      expect(wrapper).toBeTruthy();
    });

    it('renders exactly one div', () => {
      // Act
      const divCount = wrapper.findAll('div').length;

      // Assert
      expect(divCount).toBe(1);
    });

    it('renders exactly one iframe', () => {
      // Act
      const iframeCount = wrapper.findAll('iframe').length;

      // Assert
      expect(iframeCount).toBe(1);
    });

    it('sets the CSS classes', async () => {
      // Arrange
      const inputCssClasses = 'test-class another-test-class';
      await wrapper.setProps({ cssClassName: inputCssClasses});

      // Act
      const divElement = wrapper.findAll('div')[0];

      // Assert
      expect(divElement.classes()).toContain(inputCssClasses.split(' ')[0]);
      expect(divElement.classes()).toContain(inputCssClasses.split(' ')[1]);
    });
  });

  describe('Interaction with Power BI service', () => {
    let wrapper: any = undefined;
    let spyForBootstrap: jasmine.Spy;
    let spyForEmbed: jasmine.Spy;

    const config = {
      type: 'tile',
      id: 'fakeTileId',
      dashboardId: 'fakeId',
    };

    beforeEach(() => {
      wrapper = mount(PowerBITileEmbed, {
        props: {
          cssClassName: 'test',
          embedConfig: config,
        }
      });
      spyForBootstrap = spyOn(wrapper.vm.powerbi, 'bootstrap');
      spyForEmbed = spyOn(wrapper.vm.powerbi, 'embed');
    });

    it('embeds Tile when accessToken provided', async () => {
      //Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForBootstrap).toHaveBeenCalledTimes(0);
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('bootstraps Tile when accessToken is not provided', async () => {
      //Act
      await wrapper.setProps({ embedConfig: configWithoutAccessToken });

      // Assert
      expect(spyForBootstrap).toHaveBeenCalledTimes(1);
      expect(spyForEmbed).toHaveBeenCalledTimes(0);
    });

    it('first bootstraps, then embeds when accessToken is available', async () => {
      //Act
      await wrapper.setProps({ embedConfig: configWithoutAccessToken });

      // Assert
      expect(spyForBootstrap).toHaveBeenCalledTimes(1);
      expect(spyForEmbed).toHaveBeenCalledTimes(0);

      // Resetting the Spy
      spyForBootstrap.calls.reset();
      spyForEmbed.calls.reset();

      await wrapper.setProps({ embedConfig: configWithAccessToken });

      expect(spyForBootstrap).toHaveBeenCalledTimes(0);
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('embeds when embedUrl of Tile is updated in new input data', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Embed URL of different tile
      configWithAccessToken.embedUrl = 'newFakeUrl';

      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('does not embed again when accessToken and embedUrl are same', async () => {
      //Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForEmbed).toHaveBeenCalledTimes(1);

      // Resetting the Spy
      spyForBootstrap.calls.reset();
      spyForEmbed.calls.reset();

      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForEmbed).not.toHaveBeenCalled();
    });
  });

  describe('Tests for setting event handlers', () => {
    let wrapper: any = undefined;
    const numberEventEndlersWithNull = 2;
    let testTile: any = undefined;
    const eventHandlers = new Map([
      ['tileLoaded', () => {}],
      ['tileClicked', () => {}],
      ['error', () => { }],
    ]);

    beforeEach(() => {
      wrapper = mount(PowerBITileEmbed, {
        props: {
          embedConfig: configWithAccessToken,
          cssClassName: 'test',
        }
      });

      // Initiliaze testTile
      testTile = wrapper.vm.getTile();
    });

    it('clears previous event handlers and sets new event handlers', async () => {
      // Act
      spyOn(testTile, 'on');
      spyOn(testTile, 'off');

      const props = {
        eventHandlers: eventHandlers,
      };
      await wrapper.setProps(props);

      // Assert
      expect(testTile.off).toHaveBeenCalledTimes(eventHandlers.size);
      expect(testTile.on).toHaveBeenCalledTimes(eventHandlers.size);
    });

    it('clears already set event handlers in case of null provided for event handlers', async () => {
      // Arrange
      const eventHandlersWithNull = new Map([
        ['tileLoaded', null],
        ['tileClicked', null],
        ['error', () => { }],
      ]);

      // Act
      spyOn(testTile, 'on');
      spyOn(testTile, 'off');

      const props = {
        eventHandlers: eventHandlersWithNull,
      };

      await wrapper.setProps(props);

      //Assert
      expect(testTile.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Two events are removed in new event handlers
      expect(testTile.on).toHaveBeenCalledTimes(eventHandlers.size - numberEventEndlersWithNull);
    });

    it('does not console error for valid events of tile', async () => {
      const props = {
        eventHandlers: eventHandlers,
      };

      // Act
      spyOn(console, 'error');
      await wrapper.setProps(props);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('consoles error for invalid events', async () => {
      // Arrange
      const invalidEvent1 = 'invalidEvent1';
      const errorMessage = `Following events are invalid: ${invalidEvent1}`;
      const services = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);

      const eventHandlers = new Map([
        [invalidEvent1, function () { }],
        ['rendered', function () { }],
        ['error', function () { }]
      ]);
      const props = {
        eventHandlers: eventHandlers,
        service: services
      };

      // Act
      spyOn(console, 'error');
      await wrapper.setProps(props)

      //Assert
      expect(console.error).toHaveBeenCalledWith(errorMessage);
    });

    it('does not set the same eventHandler map again', async () => {
      // Act
      const props = {
        eventHandlers: eventHandlers
      };

      const spyForOn = spyOn(testTile, 'on');
      const spyForOff = spyOn(testTile, 'off');
      await wrapper.setProps(props);

      // Assert
      expect(testTile.on).toHaveBeenCalledTimes(eventHandlers.size);
      expect(testTile.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Reset the calls for next act
      spyForOn.calls.reset();
      spyForOff.calls.reset();

      // Act - with new eventHandlers
      await wrapper.setProps(props);

      // Assert
      expect(testTile.on).toHaveBeenCalledTimes(0);
      expect(testTile.off).toHaveBeenCalledTimes(0);
    });
  });

  describe('Tests for tile features', () => {
    const fakeTileId: any = 'fakeTileId';

    it('returns id of embedded tile', () => {
      // Arrange
      const wrapper = mount(PowerBITileEmbed, {
        props: {
          embedConfig: configWithAccessToken,
          cssClassName: 'test',
        },
      });

      // Initialize testTile
      const testTile = wrapper.vm.getTile();
      const expectedTestTileId = fakeTileId;
      // Act
      const testTileId = testTile.getId();

      // Assert
      expect(testTileId).toEqual(expectedTestTileId);
    });
  });
});