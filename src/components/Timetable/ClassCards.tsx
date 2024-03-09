import React from 'react';
import { ClassData } from '@/types/ClassData';
import { Table, TableRow, TableCell } from '@mui/material';

interface ClassCardsProps {
  classes: ClassData[];
  startTime: number;
  rows: number;
}

const ClassCards: React.FC<ClassCardsProps> = ({ classes, startTime, rows }) => {
  const classesByDay: Map<string, ClassData[]> = new Map(['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => [day, []]));
  classes.forEach(c => {
    const dayClasses = classesByDay.get(c.day);
    if (dayClasses) {
      dayClasses.push(c);
    } else {
      // If the dayClasses is undefined, initialize it with an empty array and push the class c into it
      classesByDay.set(c.day, [c]);
    }
  });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1 }}></div>
      <div style={{ flexGrow: rows * 2, display: 'flex', flexBasis: '0%' }}>
        <Table style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <tbody style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TableRow style={{ display: 'flex', flexGrow: 1, flexDirection: 'row' }}>
              {Array.from(classesByDay.values()).map((classes, i) => {
                // Turn into clusters of overlapping classes
                const clusters: ClassData[][][] = [];
                let currCluster: ClassData[][] = [];
                classes.sort((a, b) => +a.startTime - +b.startTime + +a.endTime - +b.endTime);

                classes.forEach(c => {
                  // No existing cluster exists, so create one
                  if (currCluster.length === 0) {
                    currCluster.push([c]);
                    return;
                  }
                  // An existing cluster exists, so figure out if this class is part of it.
                  const lastElems = currCluster.map(col => col[col.length - 1]);
                  // Case where all elements in existing cluster end before the start of the current class
                  // => make new cluster
                  if (lastElems.filter(lastInCol => +lastInCol.endTime > +c.startTime).length === 0) {
                    clusters.push(currCluster);
                    currCluster = [[c]];
                    return;
                  }
                  // Case where not all existing classes in the cluster end before the start of the current class
                  // (Specifically when an earlier column is free)
                  // => Join cluster
                  for (let k = 0; k < lastElems.length; k++) {
                    if (+lastElems[k].endTime <= +c.startTime) {
                      currCluster[k].push(c);
                      return;
                    }
                  }
                  // No columns in current cluster are free => create new cluster column.
                  currCluster.push([c]);
                });
                // In case there was leftover
                if (currCluster.length > 0) {
                  clusters.push(currCluster);
                }

                let lastEnd = 0;

                return (
                  <TableCell
                    key={i}
                    style={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '0px',
                      flexBasis: '0%',
                      overflow: 'scroll',
                    }}
                  >
                    {clusters.map((cluster, j) => {
                      const clusterStart = +cluster[0][0].startTime / 100;
                      const clusterEnd = Math.min(...cluster.map(col => +col[col.length - 1].endTime / 100));

                      const absoluteStart = clusterStart - startTime;
                      const paddingAbove = absoluteStart - lastEnd;
                      lastEnd = clusterEnd - startTime;

                      return (
                        <React.Fragment key={j}>
                          <div style={{ flexGrow: paddingAbove, flexBasis: '0%' }}></div>
                          <div style={{ flexGrow: clusterEnd - clusterStart, display: 'flex', flexDirection: 'row', flexBasis: '0%' }}>
                            {cluster.map((col, k) => {
                              let lastClassEnd = 0;
                              return (
                                <div
                                  key={k}
                                  style={{
                                    flexGrow: 1,
                                    flexBasis: '0%',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}
                                >
                                  {col.map((c, p) => {
                                    const classStart = +c.startTime / 100;
                                    const paddingAbove = classStart - clusterStart;

                                    const classEnd = +c.endTime / 100;
                                    lastClassEnd = classEnd - clusterStart;
                                    return (
                                      <React.Fragment key={p}>
                                        <div style={{ flexGrow: paddingAbove, flexBasis: '0%' }}></div>
                                        <div
                                          style={{
                                            flexGrow: classEnd - classStart,
                                            backgroundColor: 'orange',
                                            borderRadius: '4px',
                                            margin: '4px',
                                            padding: '4px',
                                          }}
                                        >
                                          {c.lessonType}
                                        </div>
                                      </React.Fragment>
                                    );
                                  })}
                                  <div style={{ flexBasis: '0%', flexGrow: clusterEnd - clusterStart - lastClassEnd }}></div>
                                </div>
                              );
                            })}
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div style={{ flexGrow: rows - lastEnd, flexBasis: '0%' }}></div>
                  </TableCell>
                );
              })}
            </TableRow>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ClassCards;