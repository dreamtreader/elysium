const ErrorPage = ({ error }: { error?: string }) => {
  return (
    <div className="w-full p-4 text-center text-csblue-600 h-full bg-csblue-200">
      <span className="text-8xl font-bold">
        <i className="bi bi-emoji-frown-fill"></i>
      </span>
      <h1 className="text-4xl font-bold">Sorry!</h1>
      <p className="mt-4 text-2xl font-bold">
        {error
          ? error
          : "You're either witnessing an error on our side or you're trying to break things yourself. Please not the latter :)"}
      </p>
    </div>
  )
}

export default ErrorPage
