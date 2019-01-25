<template>
  <div id="app" style="width: auto; display: block; text-align: center">
    <AnotherRecordLibary />
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import AnotherRecordLibary from './components/AnotherRecordLibary.vue'

export default {
  name: 'app',
  components: {
    AnotherRecordLibary
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
