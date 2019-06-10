import * as React from 'react';
import * as styles from './app.component.scss';
import { Demo } from './demo';
import { nav, Reference } from './nav/tree';
import { Title } from './nav/title';
import { Sidebar } from './nav/sidebar';
import { Highlighted } from './highlighted';
import GithubCorner from 'react-github-corner';

const navigation = nav('arcade-machine-react', {
  basics: nav('The Basics', {
    demo: nav('Demo: Hello, World!'),
  }),
  root: nav('<ArcRoot />', {
    inputs: nav('Input Methods Configuration'),
    scrolling: nav('Scrolling Configuration'),
    store: nav('Element Store Configuration'),
    focus: nav('Focus Strategy Configuration'),
  }),
  autofocus: nav('<Autofocus />', {
    demo: nav('Demo: Autofocus'),
  }),
  handlers: nav('<Scope />', {
    demo: nav('Demo: Set Next Elements'),
  }),
  focusTraps: nav('<FocusTrap />', {
    demo: nav('Demo: Modal with Focus Trap'),
  }),
  focusArea: nav('<FocusArea />', {
    demo: nav('Demo: Content Rows'),
  }),
  focusExclude: nav('<FocusExclude  />', {
    demo: nav('Demo: Excluded Rows'),
  }),
  scrollable: nav('<Scrollable />', {
    demo: nav('Demo: Scrolling'),
  }),
  forms: nav('Forms'),
  benchmarks: nav('Benchmarks'),
  faq: nav('FAQ'),
});

export const App: React.FC = () => (
  <>
    <GithubCorner href="https://github.com/mixer/arcade-machine-react" />
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
      <Title node={navigation.root} />
      <p>
        The ArcRoot is the higher-order component that wraps your application and provides
        configuration. You can see an example of this component in the demo directly above. Nodes
        outside of the root won't be focusable. When you create the root, you'll be asked to provide
        an options object. You can create a default one by calling <code>defaultOptions()</code>.
        <sup>
          <Reference node={navigation.faq}>Why is this not a default argument?</Reference>
        </sup>{' '}
        The type definitions for this live{' '}
        <a href="https://github.com/mixer/arcade-machine-react/blob/master/src/components/arc-root.tsx#L22">
          here
        </a>
        . We'll go through each option at a time, and in all of these it will be helpful to
        reference the arcade-machine source code when discussing the provided interfaces and
        implementations.
      </p>
      <Highlighted
        code="export interface IRootOptions {
  inputs: IInputMethod[];
  focus: IFocusStrategy[];
  elementStore: IElementStore;
  scrolling: IScrollingAlgorithm;
}

export function defaultOptions(): IRootOptions {
  return {
    elementStore: new NativeElementStore(),
    focus: [new FocusByRegistry(), new FocusByDistance()],
    inputs: [new GamepadInput(), new KeyboardInput()],
    scrolling: new NativeSmoothScrollingAlgorithm(new SmoothScrollingAlgorithm()),
  };
}"
      />
      <Title node={navigation.root.inputs} />
      <p>
        The input methods allow you to configure where arcade-machine reads input from. By default,
        we'll pull from both the HTML gamepad API, as well as keyboard input. Arcade machine
        provides and reads from the following input methods by default:
      </p>
      <ul>
        <li>
          <code>{'KeyboardInput(directionMap: Map<number, Button> = defaultMap)'}</code>: this
          simply maps keycodes from <code>keydown</code> events into button presses. The default
          mapping can be found as a static field on the class, and you can optionally provide your
          own.
        </li>
        <li>
          <code>GamepadInput(useUwpKeyboardMapping: boolean = true)</code>: this uses the{' '}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API">
            HTML5 Gamepad API
          </a>{' '}
          if available, polling for input data and translating those into button presses. Note that
          in the case of UWPs, we will attempt to activate <code>gamepadInputEmulation</code> to
          have the platform give us events more efficiently. However, you can disable this by
          providing <code>false</code> as the first argument to the constructor
        </li>
      </ul>
      <Title node={navigation.root.inputs} />
      <p>
        This configures the scrolling algorithm to use with the{' '}
        <Reference node={navigation.scrollable} /> component. Two implementations are provided in
        arcade-machine, with one default:
      </p>
      <ul>
        <li>
          <code>NativeSmoothScrollingAlgorithm(fallback?: IScrollingAlgorithm)</code>: (default)
          this uses the native{' '}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo">
            <code>scrollTo()</code>
          </a>{' '}
          method with <code>behavior: 'smooth'</code> to smoothly scroll the element into view. Note
          that <code>scrollTo()</code> is not yet supported in all scenarios on all browsers. You
          can optionally provide a fallback algorithm to use if <code>scrollTo()</code> fails. Also
          note that some browsers support this method, but don't implement{' '}
          <code>behavior: 'smooth'</code>.
        </li>
        <li>
          <code>SmoothScrollingAlgorithm(speed?: number, smoothing?: EasingFunction)</code>: a
          hand-implemented smooth scrolling algorithm. Far less efficient than{' '}
          <code>NativeSmoothScrollingAlgorithm</code>, but good if smooth scrolling is a must-have
          on an older browser target.
        </li>
      </ul>
      <Title node={navigation.root.store} />
      <p>
        This configures how focus to elements is recorded and given. By default, we use the{' '}
        <code>NativeElementStore</code>. This is your standard browser-managed focus. We'll call{' '}
        <code>element.focus()</code> when things need focus, and you'll be able to manage it in your
        selectors via <code>:focus</code>.
      </p>
      <p>
        The virtual store is different. We'll only actually give focus to elements that require it
        (form inputs and content editable), though this is configurable. Instead, we'll only record
        the change of focus internally, and apply the class <code>arc-selected</code> to any element
        that's currently in focus. However, this comes at the cost of complexity and possible
        accessibility considerations--although both are solvable, as we've done in the Mixer Xbox
        app.
      </p>
      <p>Why would you want to use the virtual element store? Two reasons:</p>
      <ul>
        <li>
          Performance. Browsers do more when giving native focus. In our benchmarks, this is the
          plurality or majority of CPU time on complex pages.
        </li>
        <li>
          Scrolling behavior. By default, browsers will try to immediately ensure every focused
          element is in the window. This can sometimes shear the layout of complex pages, and also
          prevents smooth scrolling that <Reference node={navigation.scrollable} /> would otherwise
          be able to provide.
        </li>
      </ul>
      With that, the two implementations are:
      <ol>
        <li>
          <code>NativeElementStore()</code>: takes no arguments.
        </li>
        <li>
          <code>VirtualElementStore(needsNativeFocus?: (element: HTMLElement) => boolean)</code>:
          takes a function that, given an HTML element, returns whether it should be given native
          browser focus. If not provided, only <code>{'<textarea />'}</code>,{' '}
          <code>{'<input />'}</code>, and <code>contentEditable</code> elements will receive native
          focus.
        </li>
      </ol>
      <Title node={navigation.root.focus} />
      <p>
        This is generally not something you'll want to configure, but it's available to you. This
        option is what arcade machine uses to figure out what to focus next. It loops through each
        provided strategy in the order provided, and focuses on the first candidate returned. By
        default, there are two strategies provided, in order:
      </p>
      <ol>
        <li>
          <code>FocusByRegistry()</code>: this hooks into and provides manually-configured focuses
          given in <Reference node={navigation.handlers} /> components. It passes through if there's
          no associated scope.
        </li>
        <li>
          <code>FocusByDistance()</code>: this is where the dirty work happens. It's a condensed
          version of{' '}
          <a href="https://github.com/winjs/winjs/blob/562e846b0538df05e1e1e3a8ca74e508e09cba2f/src/js/WinJS/XYFocus.ts">
            WinJS' XYFocus
          </a>{' '}
          algorithm.
        </li>
        <li>
          <code>FocusByRaycast()</code>: this is not enabled by default. It's an algorithm that uses{' '}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/DocumentOrShadowRoot/elementFromPoint">
            elementFromPoint
          </a>{' '}
          to raycast out from the edge of the currently selected element. This is very efficient,
          but may not always find the optimal element in all cases.
        </li>
      </ol>
      <Title node={navigation.autofocus} />
      <p>
        The autofocus component transfers focus to one of its child elements as soon as it's
        created. You can provide a <code>target</code>, either a selector string or an element,
        which should be focused. If none is provided, it'll focus the first selectable child it
        finds.
      </p>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <code>target</code>
            </td>
            <td>
              <code>undefined | string | HTMLElement</code>
            </td>
            <td>
              Element or selector to give focus to. If not provided, the first focusable child will
              be selected.
            </td>
          </tr>
        </tbody>
      </table>
      <Title node={navigation.autofocus.demo} />
      <p>
        In this example, we autofocus on the second box in the second column. You can toggle whether
        the autofocus area is visible, and observe the focus being transferred when the autofocus
        component appears.
      </p>
      <Demo name="autofocus" />
      <Title node={navigation.handlers} />
      <p>
        You can handle focus events using <code>{'<Scope />'}</code>. You can specify elements that
        should be focused after this one (by selector or the actual element), and additionally add
        handlers that hook into incoming, outgoing, and button press events. This is the base
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
        will instead focus on adjacent boxes. By default, if no focusable element can be found after
        a key press, nothing would happen.
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
        Here, we trap focus inside the modal when it's open. We also use <code>{`<Scope />`}</code>{' '}
        to close the modal when "back" (B on Xbox controllers, or Escape on the keyboard) is
        pressed.
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
        if you have content that's loading in or disabled. By default, it'll only exclude its direct
        child node, and it will prevent the entire subtree from being focused on if{' '}
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
      <Demo name="focus-exclude" />
      <Title node={navigation.scrollable} />
      <p>
        By default, browsers will automatically scroll whenever to the focused element when you use
        native focus. We have scrolling functionality built-in in the event you use the virtual
        element store (see: <Reference node={navigation.root.store} />
        ), rather than native focus. Our implementation also supports smooth scrolling out of the
        box.
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
      <Title node={navigation.forms} />
      <p>
        Arcade machine plays nicely with forms. Note that after typing, you can still navigate
        within the bounds of the input until you reach left or right edge. Here's an example. We're
        using the virtual element store.
      </p>
      <Demo name="forms" />
      <Title node={navigation.benchmarks} />
      <p>
        The first benchmark here is the base case, manually calling <code>.focus()</code> on an
        element in the DOM without arcade-machine. The subsequent benchmarks are various
        arcade-machine scenarios, where we fake button presses and bubble through the full stack.
      </p>
      <ul>
        <li>
          On Chrome arcade machine has been seen to offer performance close to (within 0.7-1x) base
          when using the native store, and faster (1-3x) when using the virtual store.
        </li>
        <li>
          For UWPs/Edge, its JavaScript engine is fast for our scenario, but its native browser{' '}
          <code>.focus()</code> is slower than Chrome. Using the native store in arcade-machine is
          on-par with not using arcade-machine at all, and using the virtual store is reliabily much
          faster (around 3x) than the former scenarios browser focus.
        </li>
      </ul>
      <Demo name="benchmarks" />
      <Title node={navigation.faq} />
      <dl>
        <dt>
          <a id="why-tabindex" /> Why do I need a <code>tabIndex</code> on focusable items?
        </dt>
        <dd>
          The DOM API lacks an efficient way to query focusable elements. Similar directional
          navigation implementations get around this by querying all elements on focus change, and
          manually looking for ones that should be focusable. We use the tabIndex property as a flag
          which allows us to ask the browser to filter out the noise, which increases performance
          significantly.
        </dd>
        <dt>
          <a id="why-tabindex" /> Why do I need to explicitly provide the{' '}
          <code>defaultOptions()</code> in <code>ArcRoot</code>?
        </dt>
        <dd>
          We do this so that the services within the default options can be tree-shaken out for
          consumers who opt not to include the defaults. If they were a default argument value, it
          would be difficult for the compiler to provide that they're unused, even if that may be
          the case.
        </dd>
      </dl>
    </div>
  </>
);
