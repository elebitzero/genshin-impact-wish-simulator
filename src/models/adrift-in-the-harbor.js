import BaseGacha from './base-gacha'
import drops from '../data/adrift-in-the-harbor.json'

export default class AdriftInTheHarbor extends BaseGacha {
  constructor() {
    super(drops)
    this.pityCounter = 0;
    this.attemptsCount = 0;
    this.guaranteedFeatured4Star = false
    this.guaranteed5Star = false
    this.guaranteedGanyu = false
    this.softPity75 = false
    this.probabilityRange = this.generateProbabilityRange(943, 51, 6)
  }
  set attempts(amount) {
    this.attemptsCount += amount
    this.pityCounter += amount
    this.guaranteed5Star = !(this.pityCounter % 90)
    this.softPity75 = !(this.pityCounter % 75)
  }
  roll() {
    const roll = []
    this.shuffle(this.probabilityRange)
    this.attempts = 10
    //checks to see if it is the 75th attempt to apply soft pity (32% flat chance to pull 5 star)
    if (this.softPity75) {
      this.probabilityRange = this.generateProbabilityRange(629, 51, 320)
    }
    // checks to see if 90 attempts have passed, and grabs 5 star item
    if (this.guaranteed5Star) {
      roll.push(this.getGuaranteed5StarItem())
    }
// 4 star item or higher guaranteed every 10 rolls


    const rollsToGo = 10 - roll.length

    for (let i = 0; i < rollsToGo; i++) {
      if((i === rollsToGo - 1) && !(roll.find(item => item.rating === 4))) {
        roll.push(this.getGuaranteed4StarItemOrHigher())
        break;
      }
      roll.push(this.rollBasedOffProbability())
    }
    return roll
  }
  rollOnce() {
    this.attempts = 1
    if (this.softPity75) {
      this.probabilityRange = this.generateProbabilityRange(629, 51, 320)
    }
    if (this.guaranteed5Star) {
      return this.getRandomItem(5)
    }
    const guaranteed4Star = !(this.pityCounter % 10)
    if (guaranteed4Star) {
      return this.getGuaranteed4StarItemOrHigher()
    }
    return this.singlePull()
  }
  rollBasedOffProbability() {
    return this.getRandomItem(this.getRandomRating())
  }
  getRandomItem(rating) {
    const itemsList = this.getDrops(rating);
    let item;
    if (rating === 5) {
      this.pityCounter = 0
      this.probabilityRange = this.generateProbabilityRange(943, 51, 6)
    }

    if (this.guaranteedGanyu && rating === 5) {
      return this.grabAGanyu();
    } else {
      item = itemsList[this.generateRandomNumber(itemsList.length)];
    }

    if (item.rating === 5 && item.name !== 'Ganyu') {
      this.guaranteedGanyu = true;
    }

    return item
  }
  getGuaranteed5StarItem() {
    const isGanyu = this.flipACoin()
    if (this.guaranteedGanyu || isGanyu) {
      return this.grabAGanyu()
    }
    return this.getRandomItem(5)
  }
  getGuaranteed4StarItemOrHigher() {
    // .5% chance of getting 5 star item
    const itemRating = this.getRandomRating()
    const didUserGet5StarItem = itemRating === 5
    if (didUserGet5StarItem) {
      return this.getRandomItem(5)
    }
    const isFeatured4StarCharacter = this.flipACoin()
    if (isFeatured4StarCharacter || this.guaranteedFeatured4Star) {
      this.guaranteedFeatured4Star = false
      return this.getRandomFeatured4StarItem()
    } else {
      this.guaranteedFeatured4Star = true
      return this.getRandomItem(4)
    }

  }
  getRandomFeatured4StarItem() {
    const items = this.getDrops(4)
    const featuredItems = items.filter(item => item.rating === 4 && item.isFeatured === true)
    return featuredItems[this.generateRandomNumber(featuredItems.length)]
  }
  grabAGanyu() {
    this.guaranteedGanyu = false
    this.pityCounter = 0
    this.probabilityRange = this.generateProbabilityRange(943, 51, 6)
    return this.drops.find(item => item.name === 'Ganyu')
  }
}