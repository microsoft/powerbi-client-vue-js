// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '../crypto.mock';
import { mount, enableAutoUnmount  } from '@vue/test-utils';
import { factories, service } from 'powerbi-client';
import { IReportCreateConfiguration } from 'powerbi-models';

import PowerBICreateReport from '../../../components/PowerBICreateReport'

enableAutoUnmount(afterEach);

describe('PowerBICreateReport', () => {
  // Basic configuration for create report with accessToken
  const configWithAccessToken: IReportCreateConfiguration = {
    type: 'create',
    datasetId: 'fakeId',
    embedUrl: 'fakeUrl',
    accessToken: 'fakeToken',
  };

  describe('Basic tests', () => {
    let wrapper: any = undefined;

    // Basic configuration for paginated report component
    const basicProps = {
      embedConfig: configWithAccessToken,
      cssClassName: 'test',
    };

    beforeEach(() => {
      wrapper = mount(PowerBICreateReport, { props: basicProps })
    });

    it('should create', () => {
      // Assert
      expect(wrapper).toBeTruthy();
    });

    it("renders exactly one div", () => {
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
    let spyForCreate: jasmine.Spy;

    const config: IReportCreateConfiguration = {
      type: 'create',
      datasetId: 'fakeId',
      embedUrl: 'fakeUrl',
      accessToken: 'fakeToken',
    };

    beforeEach(() => {
      wrapper = mount(PowerBICreateReport, {
        props: {
          cssClassName: 'test',
          embedConfig: config,
        }
      });

      spyForCreate = spyOn(wrapper.vm.powerbi, 'createReport');
    });

    it('embeds createReport when accessToken provided', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForCreate).toHaveBeenCalledTimes(1);
    });

    it('embeds when embedUrl of createReport is updated in new input data', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // To Do: Need to Update the test case. Will be handled in seperate PR
      // Embed URL of different report
      configWithAccessToken.embedUrl = 'newFakeUrl';

      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForCreate).toHaveBeenCalledTimes(1);
    });

    it('does not embed again when accessToken and embedUrl are same', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForCreate).toHaveBeenCalledTimes(1);

      // Resetting the Spy
      spyForCreate.calls.reset();

      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForCreate).not.toHaveBeenCalled();
    });
  });

  describe('Tests for setting event handlers', () => {
    let wrapper: any = undefined;
    let testCreateReport: any = undefined;
    const eventHandlers = new Map([
      ['loaded', () => {}],
      ['rendered', () => {}],
      ['error', () => {}],
    ]);

    beforeEach(() => {
      wrapper = mount(PowerBICreateReport, {
        props: {
          embedConfig: configWithAccessToken,
          cssClassName: 'test',
        }
      });

      // Initiliaze testCreateReport
      testCreateReport = wrapper.vm.getEmbed();
    });

    it('clears previous event handlers and sets new event handlers', async () => {
      // Act
      spyOn(testCreateReport, 'on');
      spyOn(testCreateReport, 'off')

      const props = {
        eventHandlers: eventHandlers,
      };
      await wrapper.setProps(props);

      // Assert
      expect(testCreateReport.off).toHaveBeenCalledTimes(eventHandlers.size);
      expect(testCreateReport.on).toHaveBeenCalledTimes(eventHandlers.size);
    });

    it('does not set the same eventHandler map again', async () => {
      // Act
      const newEventHandlers = new Map([
        ['rendered', () => {}],
        ['loaded', () => {}],
        ['error', () => {}],
      ]);
      const props = {
        eventHandlers: eventHandlers
      };

      const spyForOn = spyOn(testCreateReport, 'on');
      const spyForOff = spyOn(testCreateReport, 'off');
      await wrapper.setProps(props);

      // Assert
      expect(testCreateReport.on).toHaveBeenCalledTimes(eventHandlers.size);
      expect(testCreateReport.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Reset the calls for next act
      spyForOn.calls.reset();
      spyForOff.calls.reset();

      const props1 = {
        eventHandlers: newEventHandlers
      };

      // Act - with new eventHandlers
      await wrapper.setProps(props1);

      // Assert
      expect(testCreateReport.on).toHaveBeenCalledTimes(0);
      expect(testCreateReport.off).toHaveBeenCalledTimes(0);
    });

    it('clears already set event handlers in case of null provided for event handlers', async () => {
      // Arrange
      const eventHandlersWithNull = new Map([
        ['loaded', null],
        ['rendered', null],
        ['error', () => {}],
      ]);
      const numberEventHandlersWithNull = 2;

      // Act
      spyOn(testCreateReport, 'on');
      spyOn(testCreateReport, 'off');

      const props = {
        eventHandlers: eventHandlersWithNull,
      };
      await wrapper.setProps(props);

      //Assert
      expect(testCreateReport.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Two events are removed in new event handlers
      expect(testCreateReport.on).toHaveBeenCalledTimes(eventHandlers.size - numberEventHandlersWithNull);
    });

    it('does not console error for valid events of report', async () => {
      // Arrange
      const allEventHandlers = new Map([
        ['loaded', () => {}],
        ['rendered', () => {}],
        ['error', () => {}],
        ['saved', () => {}],
        ['saveAsTriggered', () => {}],
        ['buttonClicked', () => {}],
        ['info', () => {}],
        ['dataSelected', () => {}],
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
        eventHandlers: eventHandlers,
        service:services
      };

      // Act
      spyOn(console, 'error');
      await wrapper.setProps(props);

      //Assert
      expect(console.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});