"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, type ReactNode } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { CurrencyInput, Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { Debt, DebtType } from "@/lib/debts"
import { MAX_NOTE, debtSchema, todayISO, type DebtFormInput, type DebtFormOutput } from "@/lib/debts"
import { useDebtMutation } from "@/hooks/use-debt-mutation"

const TYPE_OPTIONS: { value: DebtType; title: string; description: string }[] = [
  { value: "owed_to_me", title: "Saya dihutang", description: "Dia pinjam uang ke kamu" },
  { value: "i_owe", title: "Saya hutang", description: "Kamu pinjam uang ke dia" },
]

const toFormValues = (debt?: Debt): DebtFormInput =>
  debt
    ? {
        type: debt.type,
        counterpart_name: debt.counterpart_name,
        amount: debt.amount,
        due_date: debt.due_date ?? "",
        note: debt.note ?? "",
      }
    : // type and amount start empty on purpose so the user must pick them.
      ({ counterpart_name: "", due_date: todayISO(), note: "" } as DebtFormInput)

export function DebtFormDialog({ debt, children }: { debt?: Debt; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { mutate, pending } = useDebtMutation()
  const form = useForm<DebtFormInput, unknown, DebtFormOutput>({
    resolver: zodResolver(debtSchema),
    defaultValues: toFormValues(debt),
  })

  function onOpenChange(next: boolean) {
    if (next) form.reset(toFormValues(debt))
    setOpen(next)
  }

  async function onSubmit(values: DebtFormOutput) {
    const result = await mutate(
      debt
        ? { method: "PATCH", url: `/api/debts/${debt.id}`, success: "Perubahan disimpan." }
        : { method: "POST", url: "/api/debts", success: "Catatan baru tersimpan." },
      values
    )
    if (result.ok) return setOpen(false)
    // Server-side validation errors land on the same fields as client-side ones.
    for (const [name, message] of Object.entries(result.errors ?? {})) {
      form.setError(name as keyof DebtFormInput, { message }, { shouldFocus: true })
    }
  }

  const note = useWatch({ control: form.control, name: "note" })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{debt ? "Edit catatan" : "Catat baru"}</DialogTitle>
          <DialogDescription>
            {debt ? `Ubah catatan utang dengan ${debt.counterpart_name}.` : "Siapa pinjam berapa? Catat di sini."}
          </DialogDescription>
        </DialogHeader>
        <form id="debt-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Tipe</FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    className="sm:grid-cols-2"
                    aria-invalid={fieldState.invalid}
                  >
                    {TYPE_OPTIONS.map((opt, i) => (
                      <FieldLabel key={opt.value} htmlFor={`type-${opt.value}`}>
                        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                          <RadioGroupItem
                            value={opt.value}
                            id={`type-${opt.value}`}
                            ref={i === 0 ? field.ref : undefined}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldContent>
                            <FieldTitle>{opt.title}</FieldTitle>
                            <FieldDescription>{opt.description}</FieldDescription>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  <FieldError errors={[fieldState.error]} />
                </FieldSet>
              )}
            />

            <Controller
              name="counterpart_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="debt-name">Nama orang</FieldLabel>
                  <Input
                    {...field}
                    id="debt-name"
                    placeholder="Misal: Budi"
                    maxLength={100}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="debt-amount">Jumlah</FieldLabel>
                  <CurrencyInput
                    id="debt-amount"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    // float is null when the input is cleared; undefined lets zod report "required".
                    onValueChange={(_value, _name, values) => field.onChange(values?.float ?? undefined)}
                    intlConfig={{ locale: "id-ID", currency: "IDR" }}
                    allowDecimals={false}
                    allowNegativeValue={false}
                    inputMode="numeric"
                    placeholder="Rp 50.000"
                    className="tabular-nums"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="due_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="debt-date">Tanggal</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="debt-date"
                    type="date"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="debt-note">
                    Catatan <span className="font-normal text-muted-foreground">(opsional)</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id="debt-note"
                    placeholder="Misal: patungan tiket konser"
                    maxLength={MAX_NOTE}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription className="text-right tabular-nums">
                      {(note ?? "").length}/{MAX_NOTE}
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="lg">
              Batal
            </Button>
          </DialogClose>
          <Button type="submit" form="debt-form" size="lg" disabled={pending}>
            {pending && <Spinner />}
            {debt ? "Simpan perubahan" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
