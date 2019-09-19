/**
 * @typedef {Object} Card
 * @property {Number} id - Card id
 * @property {Number} width - Card width 
 * @property {String} image - Card top image
 * @property {Number} ragin - Card rating number from 0 to 5 for start
 * @property {Boolean} like - Card like state
 * @property {Boolean} online - Card user online status
 * @property {String} userName - Card user name
 * @property {Number} ratingCount - Card rating people count those who voted
 * @property {String} description - Card descriptions
 */

(function(cards){
  // Waiting to ready document
  document.addEventListener('DOMContentLoaded', () => {
    const cardWidth = 250;

    // Init cards slider
    const $slider = document.querySelector('.miraslider__slider');
    const slider = new Slider({ cards, container: $slider, cardWidth });

    // Init cards list
    const $listContainer = document.querySelector('.miraslider__list');
    if ($listContainer && Array.isArray(cards)) {
      cards.forEach((card) => {
        card.width = cardWidth;
        $listContainer.appendChild(new Card(card).el);
      });
    }
  });

  /**
   * Constructor of Card
   * 
   * @param {Object<Card>} props 
   */
  function Card(props) {
    try {
      const {
        like, image, price, rating, userName,
        ratingCount, description, width, online, id,
      } = props;
      
      // Prepare card element
      this.el = document.createElement('div');
      this.el.className = 'miraslider__card';

      // Prepare Card data
      this.id = id || Math.floor(Math.random() * 1000);
      this.like = like || false;
      this.width = width || 300;
      this.image = image || 'https://vollrath.com/ClientCss/images/VollrathImages/No_Image_Available.jpg';
      this.price = price || 0;
      this.rating = rating || 0;
      this.online = online || false;
      this.userName = userName || 'anon';
      this.ratingCount = ratingCount || 0;
      this.description = description || '';
      
      this.render();
    } catch (error) {
      console.error('Error on Card constructor: ', error.message);
    }
  }

  Card.prototype.render = function() {
    try {
      const {
        like, image, price, rating, userName,
        ratingCount, description, width, online,
      } = this;
      const likeClass = like
        ? 'miraslider__card-like miraslider__card-like--on'
        : 'miraslider__card-like miraslider__card-like--off';
      
      const onlineClass = online
        ? 'miraslider__dot miraslider__dot--on'
        : 'miraslider__dot miraslider__dot--off'

      const templateString = `<div
          class="miraslider__card-container"
          style="width:${width}px"
        >
          <div
            class="miraslider__card-image"
            style="background-image: url(${image})"
          ></div>
          <div class="miraslider__card-about">
            <div class="miraslider__card-description">
              ${description}
            </div>

            <div class="miraslider__card-stats">
              <div class="miraslider__card-user">
                <span class="${onlineClass}"></span>
                ${userName}
              </div>

              <div class="miraslider__card-stat">
                <div class="miraslider__card-rating">
                  ★ ${rating}
                </div>

                <div class="miraslider__card-rating-count">
                  (${ratingCount})
                </div>
              </div>
            </div>

            <div class="miraslider__card-footer">
              <div class="${likeClass}">
                🖤
              </div>

              <div class="miraslider__card-price">
                от ${price}₽
              </div>
            </div>
          </div>
        </div>`;

      const template = document.createElement('template');
      template.innerHTML = templateString;
      
      this.el.innerHTML = '';
      this.el.appendChild(template.content.firstChild);
      this.setEvents();
    } catch (error) {
      console.error('Card#render()', error.message);
    }
  }

  Card.prototype.setEvents = function() {
    try {
      const likeButton = this.el.querySelector('.miraslider__card-like');

      if (likeButton) {
        likeButton.addEventListener('click', () => {
          this.like = !this.like;
          this.render();
        });
      }
    } catch (error) {
      console.error('Card#setEvents()', error.message);
    }
  }

  /**
   * Constructor of Slider
   * 
   * @param {Object} params
   * @param {Number} params.cardWidth - Reload default (300) cards width
   * @param {Array<Card>} params.card - Array of cards objects
   * @param {Object<Node>} params.container - Document element to append slider
   */
  function Slider(
    { cards, container, cardWidth } = { cards: [], container: null, cardWidth }
  ) {
    try {
      if (!container) {
        throw new Error('"container" property is required');
      }

      if (!(container instanceof HTMLElement)) {
        throw new Error('"container" should be element');
      }

      if (!Array.isArray(cards)) {
        throw new Error('"cards" property it\'s should be array');
      }

      this.page = 0;
      this.cards = cards;
      this.cardWidth = cardWidth || 300;
      this.container = container;
      this.cardPerPage = 3;
      this.currentCards = [];

      this.container.classList.add('miraslider__container');
      this.render();

      // Set event listeners
      window.onresize = this.appendCards.bind(this);
      this.$leftArrow.addEventListener('click', this.prewPage.bind(this));
      this.$rightArrow.addEventListener('click', this.nextPage.bind(this));
    } catch (error) {
      console.error('Slider#constructor(): ', error.message);
    }
  }

  Slider.prototype.prewPage = function() {
    if (this.page === 0) {
      const countPerPage = this.getCountPerPage();
      this.page = Math.floor(this.cards.length / countPerPage);
    } else {
      this.page--;
    }

    this.appendCards();
  }

  Slider.prototype.nextPage = function() {
    const lastCard = this.cards[this.cards.length - 1];
    const lastCurrentCard = this.currentCards[this.currentCards.length - 1];

    if (lastCard.id === lastCurrentCard.id) {
      this.page = 0;
    } else {
      this.page++;
    }

    this.appendCards();
  }

  Slider.prototype.getCountPerPage = function() {
    const width = this.$content.clientWidth;
    const { cardWidth } = this;
    this.cardsPerPage = Math.floor(width / cardWidth);

    return this.cardsPerPage; 
  }

  Slider.prototype.getCards = function() {
    const { page, cards, cardWidth } = this;
    const cardsPerPage = this.getCountPerPage();

    const cardsEnd = page * cardsPerPage + cardsPerPage;
    const cardsStart = page * cardsPerPage;
    this.currentCards = cards.slice(cardsStart, cardsEnd);

    return this.currentCards;
  }

  Slider.prototype.render = function() {
    try {
      this.clearContainer();
      this.createSkeleton();
      this.appendCards();
    } catch(error) {
      console.error('Slider#render(): ', error.message);
    }
  }

  Slider.prototype.clearContainer = function() {
    try {
      this.container.innerHTML = '';
    } catch (error) {
      console.error('Slider#clearContainer(): ', error.message)
    }
  }

  Slider.prototype.appendCards = function() {
    try {
      const { $content } = this;
      const cards = this.getCards();

      this.currentCards = [];
      this.$content.innerHTML = '';

      for (let i = 0, max = cards.length; i < max; i++) {
        cards[i].width = this.cardWidth;
        const card = new Card(cards[i]);

        this.currentCards.push(card);
        $content.appendChild(card.el);
      }
    } catch (error) {
      console.error('Slider#appendCards()', error.message);
    }
  }

  Slider.prototype.createSkeleton = function() {
    try {
      const arrowLeftTmpl = '<i class="arrow left"></i>';
      const arrowRightTmpl = '<i class="arrow right"></i>';

      this.$content = createContainer('miraslider__content');
      this.$leftArrow = createArrow('miraslider__left-arrow', arrowLeftTmpl);
      this.$rightArrow = createArrow('miraslider__right-arrow', arrowRightTmpl);

      this.container.appendChild(this.$leftArrow);
      this.container.appendChild(this.$content);
      this.container.appendChild(this.$rightArrow);

      function createContainer(className) {
        const $el = document.createElement('div');
        $el.classList.add(className);
        return $el;
      }

      function createArrow(className, html) {
        const $el = document.createElement('div');

        $el.classList.add(className);
        $el.innerHTML = html;

        return $el;
      }
    } catch (error) {
      console.error('Slider#createSkeleton()', error.message);
    }
  }
}([
  {
    id: 1,
    like: true,
    image: 'https://www.nocoastbestcoast.com/images/lake-erin-chippewa-national-forest-1.jpg',
    price: 600,
    rating: 5,
    online: true,
    userName: 'Pavel',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 2,
    like: false,
    image: 'https://images-na.ssl-images-amazon.com/images/I/91QdQThFP5L._CR130,0,1249,1249_UX256.jpg',
    price: 700,
    rating: 5,
    online: true,
    userName: 'Pavel',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 3,
    like: true,
    image: 'https://is5-ssl.mzstatic.com/image/thumb/Purple/v4/ea/7f/f5/ea7ff5ce-401e-0c27-3811-ee26474d734b/source/256x256bb.jpg',
    price: 800,
    rating: 5,
    online: true,
    userName: 'Maxim',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 4,
    like: true,
    image: 'https://static-s.aa-cdn.net/img/gp/20600001582788/2vOv87Al8b_kWqNBafObxqjHZrBJZWVwtrCA6N4FuEIvhyGapx2ICvXxHSTBhLdomGU=w300?v=1',
    price: 900,
    rating: 5,
    online: true,
    userName: 'Inna',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 5,
    like: false,
    image: 'http://img1.liveinternet.ru/images/attach/d/1/134/194/134194351_4954089_mart_02.JPG',
    price: 1000,
    rating: 5,
    online: false,
    userName: 'Pavel',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 6,
    like: true,
    image: 'https://cdn141.picsart.com/300441453138201.jpg?c256x256',
    price: 1100,
    rating: 5,
    online: true,
    userName: 'Nataly',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 7,
    like: false,
    image: 'https://www.nocoastbestcoast.com/images/lake-erin-chippewa-national-forest-1.jpg',
    price: 1200,
    rating: 5,
    online: false,
    userName: 'Pavel',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 8,
    like: true,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-FXjFt4A6VT88ZqeMoRe0IsB55YfSrtadxBJiArO_dh_8nEIjMA',
    price: 1300,
    rating: 5,
    online: true,
    userName: 'Pavel',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 9,
    like: true,
    image: 'https://www.victoriatrails.com/images/photos/thumbnail/francis-king-regional-park-4@2x.jpg',
    price: 1400,
    rating: 5,
    online: false,
    userName: 'Pavel',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
  {
    id: 10,
    like: true,
    image: 'https://www.nocoastbestcoast.com/images/lake-erin-chippewa-national-forest-1.jpg',
    price: 1500,
    rating: 5,
    online: true,
    userName: 'Pavel',
    ratingCount: 260,
    description: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath',
  },
]));
