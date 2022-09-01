import '../crypto.mock';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import { service, factories } from 'powerbi-client';
import PowerBIQnaEmbed from '../../../components/PowerBIQnaEmbed';

enableAutoUnmount(afterEach);

describe('PowerBIQnaEmbed', () => {
    // Basic configuration for qna component with accessToken
    const configWithAccessToken = {
      type: 'qna',
      id: 'fakeId',
      embedUrl: 'fakeUrl',
      accessToken: 'fakeToken',
      datasetIds: ['fakedatasetId']
    };

    // Basic configuration for qna component without accessToken
    const configWithoutAccessToken = {
      type: 'qna',
      id: 'fakeId',
      embedUrl: 'fakeUrl',
      datasetIds: ['fakedatasetId']
    };

  describe('Basic tests', () => {
    let wrapper: any = undefined;

    //Basic configuration for qna component
    const basicProps = {
      embedConfig: configWithoutAccessToken,
      cssClassName: 'test',
    };

    beforeEach(() => {
      wrapper = mount(PowerBIQnaEmbed, {
        props: basicProps,
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
      type: 'qna',
      id: 'fakeId',
      datasetIds: ['fakedatasetId']
    };

    beforeEach(() => {
      wrapper = mount(PowerBIQnaEmbed, {
        props: {
          cssClassName: 'test',
          embedConfig: config,
        },
      });

      spyForBootstrap = spyOn(wrapper.vm.powerbi, 'bootstrap');
      spyForEmbed = spyOn(wrapper.vm.powerbi, 'embed');
    });

    it('embeds Qna when accessToken provided', async () => {
      //Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForBootstrap).toHaveBeenCalledTimes(0);
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('bootstraps Qna when accessToken is not provided', async () => {
      // Act
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

    it('embeds when embedUrl of Qna is updated in new input data', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Embed URL of different report
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

      await wrapper.setProps({
        embedConfig: configWithAccessToken,
      });

      // Assert
      expect(spyForEmbed).not.toHaveBeenCalled();
    });
  });

  describe('Tests for setting event handlers', () => {
    let wrapper: any = undefined;
    const numberEventEndlersWithNull = 2;
    let testQna: any = undefined;
    const eventHandlers = new Map([
      ['loaded', () => { }],
      ['visualRendered', () => { }],
      ['error', () => { }],
    ]);

    beforeEach(() => {
      wrapper = mount(PowerBIQnaEmbed, {
        props: {
          embedConfig: configWithAccessToken,
          cssClassName: 'test',
        }
      });

      // Initialize testQna
      testQna = wrapper.vm.getQna();
    });

    it('clears previous event handlers and sets new event handlers', async () => {
      // Act
      spyOn(testQna, 'on');
      spyOn(testQna, 'off');

      const props = {
        eventHandlers: eventHandlers,
      };
      await wrapper.setProps(props);

      expect(wrapper.vm.eventHandlers?.size).toEqual(eventHandlers.size);
    });

    it('clears already set event handlers in case of null provided for event handlers', async () => {
      // Arrange
      const eventHandlersWithNull = new Map([
        ['loaded', null],
        ['visualRendered', null],
        ['error', () => { }],
      ]);

      // Act
      spyOn(testQna, 'on');
      spyOn(testQna, 'off');

      const props = {
        eventHandlers: eventHandlersWithNull,
      };

      await wrapper.setProps(props);

      //Assert
      expect(testQna.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Two events are removed in new event handlers
      expect(testQna.on).toHaveBeenCalledTimes(eventHandlers.size - numberEventEndlersWithNull);
    });

    it('does not console error for valid events of qna', async () => {
      const props = {
        eventHandlers: eventHandlers,
      };

      // Act
      spyOn(console, 'error');
      await wrapper.setProps(props);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('consoles error for invalid events', () => {
     // Arrange
     const invalidEvent1 = 'invalidEvent1';
     const errorMessage = `Following events are invalid: ${invalidEvent1}`;

     const eventHandlers = new Map([
       [invalidEvent1, function () { }],
       ['rendered', function () { }],
       ['error', function () { }]
     ]);

     // Act
     spyOn(console, 'error');
     wrapper.vm.powerbi = new service.Service( factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
     wrapper.vm.setEventHandlers(wrapper.vm.embed, eventHandlers);

     //Assert
     expect(console.error).toHaveBeenCalledWith(errorMessage);
    });

    it('does not set the same eventHandler map again', async () => {
      // Act
      const props = {
        eventHandlers: eventHandlers,
      };

      const spyForOn = spyOn(testQna, 'on');
      const spyForOff = spyOn(testQna, 'off');
      await wrapper.setProps(props);

      // Assert
      expect(testQna.on).toHaveBeenCalledTimes(eventHandlers.size);
      expect(testQna.off).toHaveBeenCalledTimes(eventHandlers.size);

      // Reset the calls for next act
      spyForOn.calls.reset();
      spyForOff.calls.reset();

      // Act - with new eventHandlers
      await wrapper.setProps(props);

      // Assert
      expect(testQna.on).toHaveBeenCalledTimes(0);
      expect(testQna.off).toHaveBeenCalledTimes(0);
    });
  });
});