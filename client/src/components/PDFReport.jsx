import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 15,
    marginBottom: 25,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5', // Primary indigo color
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerDate: { 
    fontSize: 9, 
    color: '#9ca3af', 
    textAlign: 'right', 
    marginTop: 4 
  },
  section: {
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: 18,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreText: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#374151',
    flex: 1,
  },
  rowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colHalf: {
    width: '48%',
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#4b5563',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 10,
    marginBottom: 6,
    marginRight: 6,
  },
  tagGreen: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  tagRed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  table: {
    width: '100%',
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableColHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tableCol: {
    fontSize: 11,
    color: '#374151',
  },
  col1: { width: '40%', paddingRight: 10 },
  col2: { width: '40%', paddingRight: 10 },
  col3: { width: '20%' },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  barFillGreen: { height: 6, backgroundColor: '#22c55e', borderRadius: 3 },
  barFillAmber: { height: 6, backgroundColor: '#f59e0b', borderRadius: 3 },
  barFillRed: { height: 6, backgroundColor: '#ef4444', borderRadius: 3 },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    width: 25,
    textAlign: 'right',
  },
  proBox: {
    borderTopWidth: 4,
    borderTopColor: '#8b5cf6',
    backgroundColor: '#f9fafb',
    padding: 18,
    marginBottom: 15,
  },
  proBoxBlue: {
    borderTopColor: '#3b82f6',
  },
  proValue: { 
    fontSize: 28, 
    fontFamily: 'Helvetica-Bold', 
    color: '#8b5cf6', 
    marginVertical: 8 
  },
  proDesc: { 
    fontSize: 10, 
    color: '#6b7280' 
  },
  proSuggestion: { 
    fontSize: 11, 
    color: '#374151', 
    lineHeight: 1.5 
  }
});

const PDFReport = ({ data }) => {
  const {
    jobTitle,
    company,
    score,
    summary,
    matchedKeywords = [],
    missingKeywords = [],
    skillsList = [],
    isPro,
    atsScore,
    suggestions,
    createdAt
  } = data || {};

  const getScoreColor = (s) => {
    if (s >= 71) return { bg: '#dcfce7', text: '#166534' };
    if (s >= 41) return { bg: '#fef3c7', text: '#b45309' };
    return { bg: '#fee2e2', text: '#991b1b' };
  };

  const scoreColor = getScoreColor(score || 0);
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Fixed top section */}
        <View style={styles.header} fixed>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SkillFusion</Text>
          </View>
          <View>
            <Text style={styles.headerSubtitle}>AI Skills Match Report</Text>
            <Text style={styles.headerDate}>{dateStr}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.section}>
          <Text style={styles.title}>{jobTitle || 'Position'} @ {company || 'Company'}</Text>
          <Text style={styles.subtitle}>Comprehensive Match Analysis</Text>
        </View>

        {/* Match Summary */}
        <View style={styles.card}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBox, { backgroundColor: scoreColor.bg }]}>
              <Text style={[styles.scoreText, { color: scoreColor.text }]}>{score || 0}%</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor.text }]}>Match</Text>
            </View>
            <Text style={styles.summaryText}>
              {summary || `Your resume has a ${score || 0}% match with the ${jobTitle || 'Position'} role at ${company || 'Company'}.`}
            </Text>
          </View>
        </View>

        {/* Keywords */}
        <View style={[styles.rowGrid, styles.section]}>
          <View style={[styles.card, styles.colHalf]}>
            <Text style={styles.cardTitle}>Matched Keywords ({matchedKeywords.length})</Text>
            <View style={styles.tagContainer}>
              {matchedKeywords.map((kw, i) => (
                <Text key={i} style={[styles.tag, styles.tagGreen]}>{kw}</Text>
              ))}
              {matchedKeywords.length === 0 && (
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>No matched keywords found.</Text>
              )}
            </View>
          </View>

          <View style={[styles.card, styles.colHalf]}>
            <Text style={styles.cardTitle}>Missing Keywords ({missingKeywords.length})</Text>
            <View style={styles.tagContainer}>
              {missingKeywords.map((kw, i) => (
                <Text key={i} style={[styles.tag, styles.tagRed]}>{kw}</Text>
              ))}
              {missingKeywords.length === 0 && (
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>No missing keywords.</Text>
              )}
            </View>
          </View>
        </View>

        {/* Skills Match Table */}
        {skillsList.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.title, { fontSize: 16 }]}>Skills Match Breakdown</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableColHeader, styles.col1]}>Skill</Text>
                <Text style={[styles.tableColHeader, styles.col2]}>JD Requirement</Text>
                <Text style={[styles.tableColHeader, styles.col3]}>Match %</Text>
              </View>
              {skillsList.map((item, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCol, styles.col1]}>{item.skill}</Text>
                  <Text style={[styles.tableCol, styles.col2]}>{item.jd_req || '—'}</Text>
                  <View style={[styles.col3, styles.barContainer]}>
                    <View style={styles.barBg}>
                      <View 
                        style={[
                          item.percent >= 70 ? styles.barFillGreen : item.percent >= 40 ? styles.barFillAmber : styles.barFillRed,
                          { width: `${Math.min(item.percent || 0, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={[
                      styles.percentText,
                      { color: item.percent >= 70 ? '#166534' : item.percent >= 40 ? '#b45309' : '#991b1b' }
                    ]}>
                      {item.percent || 0}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pro Features */}
        {isPro && (
          <View style={[styles.rowGrid, { marginTop: 10 }]}>
            <View style={[styles.proBox, styles.colHalf]}>
              <Text style={styles.cardTitle}>ATS SCORE</Text>
              <Text style={styles.proValue}>{atsScore || 0}%</Text>
              <Text style={styles.proDesc}>Compatibility with ATS systems</Text>
            </View>
            <View style={[styles.proBox, styles.proBoxBlue, styles.colHalf]}>
              <Text style={styles.cardTitle}>AI SUGGESTIONS</Text>
              <Text style={styles.proSuggestion}>
                {suggestions || 'Your resume looks strong! Keep up the good work.'}
              </Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PDFReport;
