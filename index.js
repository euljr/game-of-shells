const CONTAINER_MARGIN_LEFT = 10;
const CONTAINER_MARGIN_TOP = 30;
const CONTAINER_WIDTH = 30;

const BALL_MARGIN = 17;

class Container {
  constructor(el) {
    this.el = el;
  }

  setPosition = (pos) => {
    this.el.style.left =
      CONTAINER_MARGIN_LEFT + pos * (CONTAINER_WIDTH + CONTAINER_MARGIN_LEFT) + 'px';
  };

  lift = () => {
    return new Promise((resolve) => {
      this.el.style.top = CONTAINER_MARGIN_TOP - BALL_MARGIN + 'px';
      setTimeout(resolve, 1000);
    });
  };

  lower = () => {
    return new Promise((resolve) => {
      this.el.style.top = CONTAINER_MARGIN_TOP + 'px';
      setTimeout(resolve, 1000);
    });
  };

  show = async () => {
    await this.lift();
    await this.lower();
  };
}

class Ball {
  constructor(el) {
    this.el = el;
  }

  hide = () => {
    this.el.style.display = 'none';
  }

  show = () => {
    this.el.style.display = 'block';
  }

  setPosition = (pos) => {
    this.el.style.left =
      BALL_MARGIN + pos * (CONTAINER_WIDTH + CONTAINER_MARGIN_LEFT) + 'px';
  };
}

class App {
  constructor() {
    this.setupElements();
    this.startGame();
  }

  setupElements = () => {
    this.containers = Array.from(document.querySelectorAll('.container'))
      .map((el, index) => {
        el.onclick = () => this.pickContainer(index)
        return new Container(el);
      });

    this.ball = new Ball(document.querySelector('.ball'));
  };

  setInitialState = () => {
    const ballPosition = Math.floor(Math.random() * 3);

    this.state = {
      order: [0, 1, 2],
      ballPosition,
      isBusy: false,
    };

    this.ball.setPosition(ballPosition);
    this.setContainerPositions();
  };

  setContainerPositions = () => {
    this.containers.forEach(
      (container, index) => container.setPosition(this.state.order[index])
    );
  };

  swapContainers = () => {
    return new Promise((resolve) => {
      const positions = [0, 1, 2];
      const posA = positions.splice(Math.floor(Math.random() * 3), 1).pop();
      const posB = positions.splice(Math.floor(Math.random() * 2), 1).pop();
      const aux = this.state.order[posA];
      this.state.order[posA] = this.state.order[posB];
      this.state.order[posB] = aux;

      this.setContainerPositions();
      setTimeout(resolve, 300);
    });
  };

  startGame = async () => {
    this.setInitialState();
    this.state.isBusy = true;
    await this.containers[this.state.ballPosition].show();
    await this.ball.hide();
    await this.swapContainers();
    await this.swapContainers();
    await this.swapContainers();
    this.state.isBusy = false;
  };

  pickContainer = async (pos) => {
    if (this.state.isBusy) return;
    this.state.isBusy = true;
    const { order, ballPosition } = this.state;
    this.ball.show();
    this.ball.setPosition(order[ballPosition]);
    await this.containers[pos].show();
    this.state.isBusy = false;
  };
}

const app = new App();
