export default async function Home() {
  const res = await fetch(
    'https://api.github.com/repos/deeja/bing-maps-loader/git/trees/master?recursive=1'
  )

  const data = await res.json()

  return (
    <div className="">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
