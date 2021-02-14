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

class Menu {
  constructor(el) {
    this.el = el;
    this.menu = el.querySelector('.menu');
    this.plus = el.querySelector('.plus');
    this.minus = el.querySelector('.minus');
    this.start = el.querySelector('.start');
    this.shuffleCount = el.querySelector('.count');
  }

  hide = () => {
    this.el.style.display = 'none';
  }

  show = () => {
    this.el.style.display = 'inherit';
  }

  setPlusClick = fn => {
    this.plus.onclick = fn;
  }

  setMinusClick = fn => {
    this.minus.onclick = fn;
  }

  setStartClick = fn => {
    this.start.onclick = () => {
      this.hide();
      fn();
    };
  }

  setShuffles = shuffles => {
    this.shuffleCount.textContent = shuffles;
  }
}

class Result {
  constructor(el) {
    this.el = el;
    this.playAgain = this.el.querySelector('.playAgain');
    this.goToMenu = this.el.querySelector('.goToMenu');
    this.winMessage = this.el.querySelector('.win');
    this.loseMessage = this.el.querySelector('.lose');
  }

  hide = () => {
    this.el.style.display = 'none';
    this.winMessage.style.display = 'none';
    this.loseMessage.style.display = 'none';
  }

  show = (win) => {
    this.el.style.display = 'inherit';

    if (win) {
      this.winMessage.style.display = 'block';
    } else {
      this.loseMessage.style.display = 'block';
    }
  }

  setPlayAgainClick = fn => {
    this.playAgain.onclick = () => {
      this.hide();
      fn();
    };
  }

  setGoToMenuClick = fn => {
    this.goToMenu.onclick = () => {
      this.hide();
      fn();
    };
  }
}

class App {
  constructor() {
    this.setupElements();
    this.setupMenu();
    this.setupResult();
    this.setInitialState();
    this.setShuffles(5);
  }

  setupElements = () => {
    this.containers = Array.from(document.querySelectorAll('.container'))
      .map((el, index) => {
        el.onclick = () => this.pickContainer(index)
        return new Container(el);
      });

    this.ball = new Ball(document.querySelector('.ball'));
  };

  setupMenu = () => {
    this.menu = new Menu(document.querySelector('.menu'));

    this.menu.setPlusClick(() => this.setShuffles(this.shuffles + 1));
    this.menu.setMinusClick(() => this.setShuffles(this.shuffles - 1));
    this.menu.setStartClick(() => this.startGame());
  };

  setShuffles = shuffles => {
    this.shuffles = shuffles;
    this.menu.setShuffles(shuffles);
  };

  setupResult = () => {
    this.result = new Result(document.querySelector('.result'));

    this.result.hide();
    this.result.setPlayAgainClick(() => this.startGame());
    this.result.setGoToMenuClick(() => this.menu.show());
  }

  setInitialState = () => {
    this.ball.hide();
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

  shuffleContainers = () => {
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
    this.state.isBusy = true;

    this.ball.show();

    await this.containers[this.state.ballPosition].show();

    this.ball.hide();

    for (let i = 0; i < this.shuffles; i++) {
      await this.shuffleContainers();
    }

    this.state.isBusy = false;
  };

  pickContainer = async (pos) => {
    if (this.state.isBusy) {
      return;
    }

    this.state.isBusy = true;

    const { order, ballPosition } = this.state;

    this.ball.show();
    this.ball.setPosition(order[ballPosition]);

    await Promise.all(
      [
        this.containers[pos].show(),
        ballPosition !== pos && this.containers[ballPosition].show(),
      ]
    );

    this.result.show(ballPosition === pos);

    this.setInitialState();
    this.state.isBusy = false;
  };
}

const app = new App();
