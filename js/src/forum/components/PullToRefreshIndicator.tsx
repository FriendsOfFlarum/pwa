import Component from 'flarum/common/Component';

export default class PullToRefreshIndicator extends Component {
  view() {
    return (
      <div className="PWA-pullToRefresh-visual" aria-hidden="true">
        <svg className="PWA-pullToRefresh-ring" viewBox="0 0 24 24" focusable="false">
          <circle className="PWA-pullToRefresh-ring-bg" cx="12" cy="12" r="9" pathLength="100" />
          <circle className="PWA-pullToRefresh-ring-line" cx="12" cy="12" r="9" pathLength="100" />
        </svg>
      </div>
    );
  }
}
