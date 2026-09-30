export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted p-4">
      <p className="text-base font-semibold">Kasbon</p>
      {children}
    </main>
  )
}
