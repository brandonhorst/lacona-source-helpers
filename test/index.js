import {fromPromise} from 'rxjs/observable/fromPromise'

import {onActivate, onFetch, onTriggerAfterActivate} from '../src'
import sinon, {spy} from 'sinon'

describe('lacona-source-helpers', () => {
  describe('onActivate', () => {
    it('calls promiseFunction on fetch and on activate', async () => {
      const promiseSpy = spy(function promise() {})
      const resultSpy = spy(function result() {})
      const activateSpy = spy(function activate() {})

      function promiseFunction ({props}) {
        promiseSpy()
        return Promise.resolve(props)
      }

      const source = onActivate(promiseFunction, 2) 
      const activate = fromPromise(new Promise((resolve, reject) => {
        setTimeout(() => {
          activateSpy()
          resolve()
        }, 0)
      }))

      const observable = source.fetch({activate, props: 1})
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

      function promiseFunction ({props}) {
        promiseSpy()
        return Promise.resolve(props)
      }

      const source = onFetch(promiseFunction, 2)

      const observable = source.fetch({props: 1})
      await observable.forEach(resultSpy)

      sinon.assert.callOrder(
        promiseSpy,
        resultSpy.withArgs(2),
        resultSpy.withArgs(1)
      )
    })
  })

  describe('onTriggerAfterActivate', () => {
    it('calls promiseFunction on the first trigger call after activation', (done) => {
      const promiseSpy = spy(function promise() {})
      const resultSpy = spy(function result() {})
      const activateSpy = spy(function activate() {})
      const triggerSpy = spy(function trigger() {})

      function promiseFunction ({props}) {
        promiseSpy()
        return Promise.resolve(props)
      }

      const source = onTriggerAfterActivate(promiseFunction, 2)

      const activate = fromPromise(new Promise((resolve, reject) => {
        setTimeout(() => {
          activateSpy()
          resolve()
        }, 0)
      }))

      const observable = source.fetch({activate, props: 1})
      observable.forEach(({trigger, data}) => {
        resultSpy(data)
        if (triggerSpy.callCount === 0) {
          setTimeout(() => {
            triggerSpy()
            trigger()
          }, 0)
        } else {
          sinon.assert.callOrder(
            resultSpy.withArgs(2),
            activateSpy,
            triggerSpy,
            promiseSpy,
            resultSpy.withArgs(1)
          )
          done()
        }
      })

    })
  })
})