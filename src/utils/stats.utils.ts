// src/utils/stats.utils.ts

import { SubjectProficiency } from "../interfaces/StudentStats.Interface";

/**
 * Calculate the average level for a specific subject.
 * @param subjects - Array of SubjectProficiency objects.
 * @param subjectName - Name of the subject to calculate the average for.
 * @returns Average level for the specified subject.
 */
export const calculateAverageLevel = (subjects: SubjectProficiency[], subjectName: string): number => {
  const subject = subjects.find(s => s.name === subjectName);
  return subject ? subject.averageLevel : 0; // Retorna 0 se o assunto não for encontrado
};

/**
 * Update or create proficiency level for a subject.
 * @param subjects - Current subjects array.
 * @param subjectName - Name of the subject.
 * @param newLevel - New level to be added.
 * @returns Updated subjects array.
 */
export const updateSubjectProficiency = (subjects: SubjectProficiency[], subjectName: string, newLevel: number): SubjectProficiency[] => {
    const subjectIndex = subjects.findIndex(s => s.name === subjectName);
  
    if (subjectIndex > -1) {
      // Atualiza a média
      const currentSubject = subjects[subjectIndex];
      const totalLevel = currentSubject.averageLevel * currentSubject.activitiesCount;
  
      // Validando se newLevel é um número
      if (typeof newLevel !== 'number') {
        throw new Error("New level must be a number.");
      }
  
      currentSubject.activitiesCount += 1;
      currentSubject.averageLevel = (totalLevel + newLevel) / currentSubject.activitiesCount;
    } else {
      // Cria um novo assunto
      subjects.push({
        name: subjectName,
        averageLevel: newLevel,
        activitiesCount: 1
      });
    }
  
    return subjects;
  };
  
