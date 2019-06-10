import * as React from 'react';
import * as styles from './app.component.scss';
import { Demo } from './demo';
import { nav, Reference } from './nav/tree';
import { Title } from './nav/title';
import { Sidebar } from './nav/sidebar';

const navigation = nav('arcade-machine-react', {
  basics: nav('The Basics', {
    demo: nav('Demo: Hello, World!'),
  }),
  handlers: nav('Custom Handlers', {
    demo: nav('Demo: Set Next Elements'),
  }),
  focusTraps: nav('Focus Traps', {
    demo: nav('Demo: Modal with Focus Trap'),
  }),
  focusArea: nav('Focus Areas', {
    demo: nav('Demo: Focus Areas'),
  }),
  focusExclude: nav('Focus Exclusion', {
    demo: nav('Demo: Focus Exclusion'),
  }),
  scrollable: nav('Scrolling', {
    demo: nav('Demo: Scrolling'),
  }),
  faq: nav('FAQ'),
});

export const App: React.FC = () => (
  <>
    <Sidebar node={navigation} />
    <div className={styles.demo}>
      <Title node={navigation} />

      <p>
        Arcade machine is an abstraction layer over gamepads for web-based platforms. It handles
        directional navigation for the application, and includes rich React bindings for integration
        with your application.
      </p>

      <Title node={navigation.basics} />
      <p>
        Arcade machine works both with keyboards and gamepads. If you have a controller, you can
        plug it into your PC now, otherwise you can play with these examples using your keyboard.
      </p>

      <p>
        To get started with arcade machine, you need to make two modifications to your application:
        wrap the root of your application in the <code>ArcRoot</code> HOC, and set a{' '}
        <code>tabIndex</code> property on all elements that should be focusable.
        <sup>
          <Reference node={navigation.faq}>Why?</Reference>
        </sup>{' '}
        The default focusable value is <code>tabIndex=0</code>.
      </p>

      <Title node={navigation.basics.demo} />

      <p>
        Here's a quick demonstration. You can navigate around the below example with your arrow
        keys, or with a connected controlled.
      </p>

      <Demo name="hello-world" />

      <Title node={navigation.handlers} />

      <p>
        You can handle focus events using <code>{'<ArcScope />'}</code>. You can specify elements
        that should be focused after this one (by selector or the actual element), and additionally
        add handlers that hook into incoming, outgoing, and button press events. This is the base
        component on which many of the following components are built. The component takes these
        properties:
      </p>

      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <code>arcFocusLeft</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>
              Element or selector which should be focused when navigating to the left of this
              component.
            </td>
          </tr>
          <tr>
            <td>
              <code>arcFocusRight</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>
              Element or selector which should be focused when navigating to the right of this
              component.
            </td>
          </tr>
          <tr>
            <td>
              <code>arcFocusUp</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>
              Element or selector which should be focused when navigating to above this component.
            </td>
          </tr>
          <tr>
            <td>
              <code>arcFocusDown</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>
              Element or selector which should be focused when navigating to below this component.
            </td>
          </tr>
          <tr>
            <td>
              <code>onOutgoing</code>
            </td>
            <td>
              <code>onOutgoing?(ev: ArcFocusEvent): void</code>
            </td>
            <td>
              Called with an IArcEvent focus is about to leave this element or one of its children.
            </td>
          </tr>
          <tr>
            <td>
              <code>onIncoming</code>
            </td>
            <td>
              <code>onIncoming?(ev: ArcFocusEvent): void</code>
            </td>
            <td>
              Called with an IArcEvent focus is about to enter this element or one of its children.
            </td>
          </tr>
          <tr>
            <td>
              <code>onIncoming</code>
            </td>
            <td>
              <code>onIncoming?(ev: ArcEvent): void</code>
            </td>
            <td>
              Triggers when a button is pressed in the element or one of its children. This will
              fire before the <code>onOutgoing</code> handler, for directional events.
            </td>
          </tr>
        </tbody>
      </table>

      <Title node={navigation.handlers.demo} />

      <p>
        Here's an example of using overriding the "next" element. On these boxes, pressing up/down
        will instead focus on adjact boxes. Normally, if no focusable element can be found next, it
        would do nothing.
      </p>

      <Demo name="scope-override-focus" />

      <Title node={navigation.focusTraps} />

      <p>
        Focus traps are used to force focus to stay within a subset of your application. This is
        great for use in modals and overlays. You can optionally set the <code>focusIn</code> and{' '}
        <code>focusOut</code> properties to HTML elements or selectors to specify where focus should
        be given when entering and leaving the focus trap, respectively.
      </p>

      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <code>focusIn</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>Element or selector to give focus to when the focus trap is created.</td>
          </tr>
          <tr>
            <td>
              <code>focusOut</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>
              Element or selector to give focus to when the focus trap is released. If not provided,
              the last focused element before the trap was created will be shown.
            </td>
          </tr>
        </tbody>
      </table>

      <Title node={navigation.focusTraps.demo} />

      <p>
        Here, we trap focus inside the modal when it's open. We also use{' '}
        <code>{`<ArcScope />`}</code> to close the modal when "back" (B on Xbox controllers, or
        Escape on the keyboard) is pressed.
      </p>

      <Demo name="modal" />

      <Title node={navigation.focusArea} />

      <p>
        Focus areas are sections of the page which act as opaque focusable 'blocks', and then
        transfer their focus to a child. This is a common pattern seen if you have multiple rows of
        content, and want focus to transfer to the first element in each row when navigating down
        between rows. It takes, as its property, a <code>focusIn</code> property, which is a
        selector or HTML element to give focus to.
      </p>

      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <code>focusIn</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>Element or selector to give focus to when the focus trap is created.</td>
          </tr>
        </tbody>
      </table>

      <Title node={navigation.focusArea.demo} />

      <p>
        In this demo, regardless of where you are in the previous row, focus is always transferred
        to the left-most element of each node when you navigate into it.
      </p>

      <Demo name="focus-areas" />

      <Title node={navigation.focusExclude} />

      <p>
        Focus exclusion areas can prevent their contents from being focused on. Simple enough. Good
        if you have content that's loading in or simply disabled. By default, it'll only exclude its
        direct child node, and it will prevent the entire subtree from being focused on if{' '}
        <code>deep</code> is set.
      </p>

      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <code>active</code>
            </td>
            <td>
              <code>undefined | boolean</code>
            </td>
            <td>Whether the exclusion is active. Defaults to true if not provided.</td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <td>
              <code>deep</code>
            </td>
            <td>
              <code>undefined | boolean</code>
            </td>
            <td>Whether to exclude the entire subtree contained in this node.</td>
          </tr>
        </tbody>
      </table>

      <Title node={navigation.focusExclude.demo} />

      <p>
        In this demo, regardless of where you are in the previous row, focus is always transferred
        to the left-most element of each node when you navigate into it.
      </p>

      <Demo name="focus-exclude" />

      <Title node={navigation.scrollable} />

      <p>
        By default, browsers will automatically scroll whenever to the focused element when you use
        native focus. We have scrolling functionality built-in in the event you use the virtual
        element store (todo: document this), rather than native focus. Our implementation also
        supports smooth scrolling out of the box.
      </p>

      <p>
        To use arcade machine's scrolling, you wrap your scroll container with the{' '}
        <code>{`<Scrollable />`}</code> element. By default, it'll scroll vertically, but you can
        override this via properties.
      </p>

      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <code>vertical</code>
            </td>
            <td>
              <code>undefined | boolean</code>
            </td>
            <td>Whether to scroll vertically, defaults to true.</td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <td>
              <code>horizontal</code>
            </td>
            <td>
              <code>undefined | boolean</code>
            </td>
            <td>Whether to scroll horizontally, defaults to true false.</td>
          </tr>
        </tbody>
      </table>

      <Title node={navigation.scrollable.demo} />

      <Demo name="focus-scrollable" />

      <Title node={navigation.faq} />

      <dl>
        <dt>
          <a id="why-tabindex" /> Why do I need a <code>tabIndex</code> on focusable items?
        </dt>
        <dd>
          The DOM API lacks an efficient way to query focusable elements. Similar directional
          navigation implementations get around this by querying all elements on focus change, and
          manually looking for ones that should be focusable. We use the tabIndex property as a flag
          which allows us to efficiently filter out the noise.
        </dd>
      </dl>
    </div>
  </>
);
