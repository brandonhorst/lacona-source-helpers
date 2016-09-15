import {Observable} from 'rxjs/observable'
import {fromPromise} from 'rxjs/observable/fromPromise'

import {onActivate, onFetch} from '../src'
import sinon, {spy} from 'sinon'

describe('lacona-source-helpers', () => {
  describe('onActivate', () => {
    it('calls promiseFunction on fetch and on activate', async () => {
      const promiseSpy = spy(function promise() {})
      const resultSpy = spy(function result() {})
      const activateSpy = spy(function activate() {})

      function promiseFunction () {
        promiseSpy()
        return Promise.resolve(1)
      }

      const source = onActivate(promiseFunction, 2) 
      const activate = fromPromise(new Promise((resolve, reject) => {
        setTimeout(() => {
          activateSpy()
          resolve()
        }, 0)
      }))

      const observable = source.fetch({activate})
      await observable.forEach(resultSpy)

      sinon.assert.callOrder(
        promiseSpy,
        resultSpy.withArgs(2),
        resultSpy.withArgs(1),
        activateSpy, 
        promiseSpy,
        resultSpy.withArgs(1))
    })
  })

  describe('onFetch', () => {
    it('calls promiseFunction on fetch', async () => {
      const promiseSpy = spy(function promise() {})
      const resultSpy = spy(function result() {})

      function promiseFunction () {
        promiseSpy()
        return Promise.resolve(1)
      }

      const source = onFetch(promiseFunction, 2)

      const observable = source.fetch()
      await observable.forEach(resultSpy)

      sinon.assert.callOrder(
        promiseSpy,
        resultSpy.withArgs(2),
        resultSpy.withArgs(1)
      )
    })
  })
})