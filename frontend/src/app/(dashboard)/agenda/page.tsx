'use client';

import { useMemo, useState } from 'react';
import { IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { AgendaFormDialog } from '@/components/agenda/agenda-form-dialog';
import { DayAgendaDialog } from '@/components/agenda/day-agenda-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAgenda } from '@/hooks/useActivities';
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  formatTime,
  isSameDay,
  toDateKey,
} from '@/lib/date';
import type { Activity } from '@/types/api';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);

const TYPE_PILL: Record<string, string> = {
  task: 'bg-primary/10 text-primary',
  meeting: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

export default function AgendaPage() {
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weeks = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const rangeFrom = weeks[0][0];
  const rangeTo = weeks[weeks.length - 1][6];

  const { data: items, isLoading } = useAgenda({
    from: new Date(
      rangeFrom.getFullYear(),
      rangeFrom.getMonth(),
      rangeFrom.getDate(),
      0,
      0,
      0,
    ).toISOString(),
    to: new Date(rangeTo.getFullYear(), rangeTo.getMonth(), rangeTo.getDate(), 23, 59, 59).toISOString(),
    includeCompleted: showCompleted,
  });

  const itemsByDay = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const item of items ?? []) {
      if (!item.dueAt) continue;
      const key = toDateKey(new Date(item.dueAt));
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
    }
    return map;
  }, [items]);

  const today = new Date();

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Tarefas e reuniões vinculadas a empresas e negociações"
        actions={
          <AgendaFormDialog
            trigger={
              <Button>
                <IconPlus size={16} className="mr-1.5" /> Novo item
              </Button>
            }
          />
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setMonthAnchor((d) => addMonths(d, -1))}
          >
            <IconChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonthAnchor(new Date())}>
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setMonthAnchor((d) => addMonths(d, 1))}
          >
            <IconChevronRight size={16} />
          </Button>

          <Select
            value={String(monthAnchor.getMonth())}
            onValueChange={(value) =>
              setMonthAnchor((d) => new Date(d.getFullYear(), Number(value), 1))
            }
          >
            <SelectTrigger className="ml-2 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_LABELS.map((label, index) => (
                <SelectItem key={label} value={String(index)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(monthAnchor.getFullYear())}
            onValueChange={(value) =>
              setMonthAnchor((d) => new Date(Number(value), d.getMonth(), 1))
            }
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="accent-primary"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Mostrar concluídos
        </label>
      </div>

      {isLoading && <p className="mb-2 text-sm text-muted-foreground">Carregando...</p>}

      <div className="overflow-x-auto rounded-lg border border-border">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {weeks.flatMap((week, weekIdx) =>
              week.map((day, dayIdx) => {
                const inMonth = day.getMonth() === monthAnchor.getMonth();
                const isToday = isSameDay(day, today);
                const dayItems = itemsByDay.get(toDateKey(day)) ?? [];
                const visible = dayItems.slice(0, 3);
                const overflowCount = dayItems.length - visible.length;

                return (
                  <button
                    key={`${weekIdx}-${dayIdx}`}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`flex min-h-[104px] flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left align-top transition-colors last:border-r-0 hover:bg-muted/40 ${
                      inMonth ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : inMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground/50'
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    <div className="flex flex-col gap-0.5">
                      {visible.map((item) => (
                        <span
                          key={item.id}
                          className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            item.completedAt
                              ? 'bg-muted text-muted-foreground line-through'
                              : TYPE_PILL[item.type] ?? 'bg-muted text-muted-foreground'
                          }`}
                          title={item.title ?? undefined}
                        >
                          {formatTime(item.dueAt!)} {item.title}
                        </span>
                      ))}
                      {overflowCount > 0 && (
                        <span className="px-1.5 text-[11px] font-medium text-muted-foreground">
                          +{overflowCount} mais
                        </span>
                      )}
                    </div>
                  </button>
                );
              }),
            )}
          </div>
        </div>
      </div>

      <DayAgendaDialog
        date={selectedDate}
        items={selectedDate ? (itemsByDay.get(toDateKey(selectedDate)) ?? []) : []}
        open={!!selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
    </div>
  );
}
