// TsxTest.tsx
import { defineComponent, reactive, onMounted, computed } from 'vue';
import {type FunctionalComponent as FC} from 'vue'
// 无状态组件
const FcNode: FC<{ data: number }> = ({ data }) => {
  return (
    <>
      <hr />
      <div>子组件：
        {data < 10 ? <span>{data}</span> : <h1>{data}</h1>}
      </div>
    </>
  )
};

// 状态组件需要使用 defineComponent
export default defineComponent({
  name: 'TsxTest',
  setup() {
    const data = reactive({ count: 0 });

    // 计算属性
    const dataComputed = computed(() => data.count * 2);

    onMounted(() => {
      data.count = 5;
    });

    const clickHandler = () => data.count++

    return () => (
      <>
        <span style={{ marginRight: '10px' }}>{ data.count }</span>
        <button onClick={clickHandler}>+</button>
        <span>计算属性：{dataComputed.value}</span>
        <FcNode data={data.count}/>
      </>
    )
  }
})
