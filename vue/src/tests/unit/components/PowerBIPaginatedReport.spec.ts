import '../crypto.mock';
import { mount, enableAutoUnmount  } from '@vue/test-utils';
import PowerBIPaginatedReportEmbed from '../../../components/PowerBIPaginatedReportEmbed';

enableAutoUnmount(afterEach);

describe('PowerBIPaginatedReportEmbed', () => {
  // Basic configuration for paginated report with accessToken
  const configWithAccessToken = {
    type: 'report',
    id: 'fakeId',
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
      wrapper = mount(PowerBIPaginatedReportEmbed, {
        props: basicProps
      });
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
      // Arrange
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
    let spyForEmbed: jasmine.Spy;

    const config = {
      type: 'report',
      id: 'fakeId',
      embedUrl: 'fakeUrl',
      accessToken: 'fakeToken',
    };

    beforeEach(() => {
      wrapper = mount(PowerBIPaginatedReportEmbed, {
        props: {
          cssClassName: 'test',
          embedConfig: config,
        }
      });

      spyForEmbed = spyOn(wrapper.vm.powerbi, 'embed');
    });

    it('embeds paginated report when accessToken provided', async () => {
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForEmbed).toHaveBeenCalledTimes(1);
    });

    it('embeds when embedUrl of paginated report is updated in new input data', async () => {
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
      // Act
      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForEmbed).toHaveBeenCalledTimes(1);

      // Resetting the Spy
      spyForEmbed.calls.reset();

      await wrapper.setProps({ embedConfig: configWithAccessToken });

      // Assert
      expect(spyForEmbed).not.toHaveBeenCalled();
    });
  });
});