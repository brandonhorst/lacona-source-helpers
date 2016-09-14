import {concat} from 'rxjs/operator/concat'
import {mergeMap} from 'rxjs/operator/mergeMap'
import {startWith} from 'rxjs/operator/startWith'
import {fromPromise} from 'rxjs/observable/fromPromise'

module.exports = {
  // Takes a function that returns a Promise
  // Returns a source that calls that function on fetch and on every Activate
  onActivate (promiseFunction, initial = null) {
    return {
      fetch ({activate}) {
        return fromPromise(promiseFunction())::concat(
          activate::mergeMap(() => {
            return fromPromise(promiseFunction())
          })
        )::startWith(initial)
      }
    }
  }
}
