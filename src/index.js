import {concat} from 'rxjs/operator/concat'
import {mergeMap} from 'rxjs/operator/mergeMap'
import {switchMap} from 'rxjs/operator/switchMap'
import {first} from 'rxjs/operator/first'
import {startWith} from 'rxjs/operator/startWith'
import {fromPromise} from 'rxjs/observable/fromPromise'
import {Observable} from 'rxjs/Observable'
import {of as ofObservable} from 'rxjs/observable/of'

export function onActivate (promiseFunction, initial = null, clear) {
  return {
    fetch ({activate, props}) {
      return fromPromise(promiseFunction(props))::concat(
        activate::mergeMap(() => {
          return fromPromise(promiseFunction())
        })
      )::startWith(initial)
    },
    clear
  }
}

export function onFetch (promiseFunction, initial = null, clear = true) {
  return {
    fetch ({props}) {
      return fromPromise(promiseFunction(props))::startWith(initial)
    },
    clear
  }
}

export function onTriggerAfterActivate (promiseFunction, initial = null, clear) {
  return {
    fetch ({activate, props}) {
      let tapObserver
      const tap = new Observable(observer => { tapObserver = observer })
      const trigger = () => tapObserver.next()

      return ofObservable(true)
        ::concat(activate)
        ::mergeMap(() => {
          return tap::first()
        })
        ::switchMap(() => {
          return promiseFunction(props).then((data) => ({trigger, data}))
        })
        ::startWith({trigger, data: initial})
    },
    clear
  }
}