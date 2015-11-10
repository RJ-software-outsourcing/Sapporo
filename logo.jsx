Logo = React.createClass({
  render() {
    // Just render a placeholder container that will be filled in
    return (
      <div className="logoSection">
        <img src="/logo.png" className="logo"/>
        <br />
        <span>Sapporo Project</span>
      </div>
    );
  }
});
