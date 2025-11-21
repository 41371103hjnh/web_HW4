import logo from './logo.svg';
import './App.css';
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#about-section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add("is-visible");
          observer.unobserve(section); // 只執行一次
        }
      });
    },
    { threshold: 0.2 } // 滑到 20% 就觸發
  );

  observer.observe(section);
});


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
