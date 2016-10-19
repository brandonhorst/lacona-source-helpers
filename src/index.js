import {concat} from 'rxjs/operator/concat'
import {mergeMap} from 'rxjs/operator/mergeMap'
import {switchMap} from 'rxjs/operator/switchMap'
import {first} from 'rxjs/operator/first'
import {startWith} from 'rxjs/operator/startWith'
import {fromPromise} from 'rxjs/observable/fromPromise'
import {interval} from 'rxjs/observable/interval'
import {Observable} from 'rxjs/Observable'
import {of as ofObservable} from 'rxjs/observable/of'

export function onActivate (promiseFunction, initial = null, clear) {
  return {
    fetch (element) {
      return fromPromise(
        Promise.resolve(promiseFunction(element))
      )::concat(
        element.activate::mergeMap(() => {
          return fromPromise(
            Promise.resolve(promiseFunction(element))
          )
        })
      )::startWith(initial)
    },
    clear
  }
}

export function onFetch (promiseFunction, initial = null, clear = true) {
  return {
    fetch (element) {
      return fromPromise(
        Promise.resolve(promiseFunction(element))
      )::startWith(initial)
    },
    clear
  }
}

export function onTriggerAfterActivate (promiseFunction, initial = null, clear) {
  return {
    fetch (element) {
      let tapObserver
      const tap = new Observable(observer => { tapObserver = observer })
      const trigger = () => tapObserver.next()

      return ofObservable(true)
        ::concat(element.activate)
        ::mergeMap(() => {
          return tap::first()
        })
        ::switchMap(() => {
          return Promise.resolve(promiseFunction(element))
            .then((data) => ({trigger, data}))
        })
        ::startWith({trigger, data: initial})
    },
    clear
  }
}

export function everyInterval (promiseFunction, ms, initial = null, clear) {
  return {
    fetch (element) {
      return fromPromise(
        Promise.resolve(promiseFunction(element))
      )::concat(interval(ms)::mergeMap(() => {
        return Promise.resolve(fromPromise(promiseFunction(element)))
      }))
      ::startWith(initial)
    }
  }
}
