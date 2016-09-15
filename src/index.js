import {concat} from 'rxjs/operator/concat'
import {mergeMap} from 'rxjs/operator/mergeMap'
import {startWith} from 'rxjs/operator/startWith'
import {fromPromise} from 'rxjs/observable/fromPromise'

export function onActivate (promiseFunction, initial = null) {
  return {
    fetch ({activate, props}) {
      return fromPromise(promiseFunction(props))::concat(
        activate::mergeMap(() => {
          return fromPromise(promiseFunction())
        })
      )::startWith(initial)
    }
  }
}

export function onFetch (promiseFunction, initial = null) {
  return {
    fetch ({props}) {
      return fromPromise(promiseFunction(props))::startWith(initial)
    }
  }
}