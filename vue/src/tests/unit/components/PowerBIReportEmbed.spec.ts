// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '../crypto.mock';
import { mount, enableAutoUnmount} from '@vue/test-utils';
import { service, factories } from 'powerbi-client';
import PowerBIReportEmbed from '../../../components/PowerBIReportEmbed';

enableAutoUnmount(afterEach);

describe('PowerBIReportEmbed', () => {
  // Basic configuration for report component with accessToken
  const configWithAccessToken = {
    type: 'report',
    id: 'fakeId',
    embedUrl: 'fakeUrl',
    accessToken: 'fakeToken',
  };

  // Basic configuration for report component without accessToken
  const configWithoutAccessToken = {
    type: 'report',
    id: 'fakeId',
    embedUrl: 'fakeUrl'
  };

  describe('Basic tests', () => {
    let wrapper: any = undefined;

    //Basic configuration for report component
    const basicProps = {
      embedConfig: { type: 'report' },
      cssClassName: 'test',
    };

    beforeEach(() => {
      wrapper = mount(PowerBIReportEmbed, {
        props: basicProps
      });
    });

    it('should create', () => {
      // Assert
      expect(wrapper).toBeTruthy();
    });

    it('renders exactly one div', () => {
      //Act
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
    let spyForLoad: jasmine.Spy;

    const config = {
      type: 'report',
    };

    beforeEach(() => {
      wrapper = mount(PowerBIReportEmbed, {
        props: {
          cssClassName: 'test',
          embedConfig: config,
        }
      });

      spyForBootstrap = spyOn(wrapper.vm.powerbi, 'bootstrap');
      spyForEmbed = spyOn(wrapper.vm.powerbi, 'embed');
      spyForLoad = spyOn(wrapper.vm.powerbi, 'load');
    });

    it('embeds report when accessToken provided', async () => {
      //Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForBootstrap).toHaveBeenCalledTimes(0);
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('bootstraps report when accessToken is not provided', async () => {
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

    it('embeds when embedUrl of report is updated in new input data', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Embed URL of different report
      configWithAccessToken.embedUrl = 'newFakeUrl';

      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('loads the report when phasedEmbedding input is true', async () => {
      // Act
      await wrapper.setProps({
        embedConfig: configWithAccessToken,
        phasedEmbedding: true
      });

      // Assert
      // service.load() is invoked once
      expect(spyForLoad).toHaveBeenCalledTimes(1);

      // service.embed() is not invoked
      expect(spyForEmbed).not.toHaveBeenCalled();
    });

    it('embeds the report when phasedEmbedding input is false', async () => {
      // Act
      await wrapper.setProps({
        embedConfig: configWithAccessToken,
        phasedEmbedding: false
      });

      // Assert
      // service.load() is not invoked
      expect(spyForLoad).not.toHaveBeenCalled();

      // service.embed() is invoked once
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('embeds the report when phasedEmbedding input is not provided', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      // service.load() is invoked once
      expect(spyForLoad).not.toHaveBeenCalled();

      // service.embed() is not invoked
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
    let testReport: any =undefined;
    const eventHandlers = new Map([
      ['loaded', () => { }],
      ['rendered', () => { }],
      ['error', () => { }],
    ]);

    beforeEach(() => {
      wrapper = mount(PowerBIReportEmbed, {
        props: {
          embedConfig: configWithAccessToken,
          cssClassName: 'test',
        }
      });

      // Initiliaze testReport
      testReport = wrapper.vm.getReport();
    });

    it('clears previous event handlers and sets new event handlers', async () => {
      // Act
      spyOn(testReport, 'on');
      spyOn(testReport, 'off')

      const props = {
        eventHandlers: eventHandlers,
      };
      await wrapper.setProps(props);

      // Assert
      expect(testReport.off).toHaveBeenCalledTimes(eventHandlers.size);
      expect(testReport.on).toHaveBeenCalledTimes(eventHandlers.size);
    });

    it('does not set the same eventHandler map again', async () => {
      // Act
      const newEventHandlers = new Map([
        ['rendered', () => { }],
        ['loaded', () => { }],
        ['error', () => { }],
      ]);
      const props = {
        eventHandlers: eventHandlers
      };

      const spyForOn = spyOn(testReport, 'on');
      const spyForOff = spyOn(testReport, 'off');
      await wrapper.setProps(props);

      // Assert
      expect(testReport.on).toHaveBeenCalledTimes(eventHandlers.size);
      expect(testReport.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Reset the calls for next act
      spyForOn.calls.reset();
      spyForOff.calls.reset();

      const props1 = {
        eventHandlers: newEventHandlers
      };

      // Act - with new eventHandlers
      await wrapper.setProps(props1);

      // Assert
      expect(testReport.on).toHaveBeenCalledTimes(0);
      expect(testReport.off).toHaveBeenCalledTimes(0);
    });

    it('clears already set event handlers in case of null provided for event handlers', async () => {
      // Arrange
      const eventHandlersWithNull = new Map([
        ['loaded', null],
        ['rendered', null],
        ['error', () => { }],
      ]);

      // Act
      spyOn(testReport, 'on');
      spyOn(testReport, 'off');

      const props = {
        eventHandlers: eventHandlersWithNull,
      };
      await wrapper.setProps(props);

      //Assert
      expect(testReport.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Two events are removed in new event handlers
      expect(testReport.on).toHaveBeenCalledTimes(eventHandlers.size - numberEventEndlersWithNull);
    });

    it('does not console error for valid events of report', async () => {
      // Arrange
      const allEventHandlers = new Map([
        ['loaded', () => { }],
        ['rendered', () => { }],
        ['error', () => { }],
        ['filtersApplied', () => { }],
        ['pageChanged', () => { }],
        ['commandTriggered', () => { }],
        ['swipeStart', () => { }],
        ['swipeEnd', () => { }],
        ['bookmarkApplied', () => { }],
        ['dataHyperlinkClicked', () => { }],
        ['visualRendered', () => { }],
        ['visualClicked', () => { }],
        ['selectionChanged', () => { }],
      ]);
      const props = {
        eventHandlers: allEventHandlers,
      };

      // Act
      spyOn(console, 'error');
      await wrapper.setProps(props);

      //Assert
      expect(console.error).not.toHaveBeenCalled();
    });

    it('consoles error for invalid events', async () => {
      // Arrange
      const invalidEvent1 = 'invalidEvent1';
      const errorMessage = `Following events are invalid: ${invalidEvent1}`;
      const services = new service.Service( factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);

      const eventHandlers = new Map([
        [invalidEvent1, function () { }],
        ['rendered', function () { }],
        ['error', function () { }]
      ]);
      const props = {
        eventHandlers:eventHandlers,
        service:services
      };

      // Act
      spyOn(console, 'error');
      await wrapper.setProps(props)

      //Assert
      expect(console.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Test for get report', () => {
    it('returns the report component', () => {
      // Arrange
      const expectedResponse = {
        config: {
          type: 'report',
          embedUrl: 'https://app.powerbi.com/reportEmbed',
          groupId: undefined,
          bootstrapped: true,
          settings: {
            filterPaneEnabled: undefined,
            navContentPaneEnabled: undefined,
          },
        },
      };

      // Act
      const wrapper = mount(PowerBIReportEmbed, {
        props: {
          embedConfig: expectedResponse.config,
          cssClassName: 'test',
        },
      });

      // Initiliaze testReport
      const response = wrapper.vm.getReport();

      // Assert
      expect(response.config).toEqual(jasmine.objectContaining(expectedResponse.config));
    });
  });
});