package com.freezzz.watchkey;

import android.app.*;
import android.content.*;
import android.os.*;
import android.view.*;
import android.widget.*;

public class MainActivity extends Activity {
  String[] labels={"Play / Pause","Следующий трек","Предыдущий трек"};
  @Override public void onCreate(Bundle b){super.onCreate(b); getWindow().setStatusBarColor(0xff101820); getWindow().setNavigationBarColor(0xff101820);
    LinearLayout root=new LinearLayout(this); root.setOrientation(1); root.setPadding(24,28,24,24); root.setBackgroundColor(0xff101820);
    TextView title=new TextView(this); title.setText("WatchKey"); title.setTextColor(0xff66fcf1); title.setTextSize(30); root.addView(title);
    TextView info=new TextView(this); info.setText("Назначение действий кнопкам управления медиа. Совместимость зависит от того, передают ли часы мультимедийные события Android."); info.setTextColor(0xffeeeeee); info.setPadding(0,12,0,20); root.addView(info);
    String[] keys={"play","next","prev"};
    for(int i=0;i<keys.length;i++){ final String key=keys[i]; TextView label=new TextView(this); label.setText(labels[i]); label.setTextColor(0xff66fcf1); label.setTextSize(16); root.addView(label); Spinner spinner=new Spinner(this); java.util.ArrayList<String> names=new java.util.ArrayList<>(); names.add("Ничего не запускать"); names.addAll(getLaunchableApps()); ArrayAdapter<String> a=new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,names); spinner.setAdapter(a); String saved=getSharedPreferences("watchkey",0).getString(key,""); int idx=names.indexOf(saved); if(idx>=0)spinner.setSelection(idx); spinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener(){public void onNothingSelected(android.widget.AdapterView<?> p){} public void onItemSelected(android.widget.AdapterView<?> p,View v,int pos,long id){getSharedPreferences("watchkey",0).edit().putString(key,pos==0?"":names.get(pos)).apply();}}); root.addView(spinner); }
    Button start=new Button(this); start.setText("Включить обработчик медиа-кнопок"); start.setOnClickListener(v->{if(Build.VERSION.SDK_INT>=26)startForegroundService(new Intent(this,KeySessionService.class));else startService(new Intent(this,KeySessionService.class)); Toast.makeText(this,"Обработчик запущен. События от часов не гарантированы.",Toast.LENGTH_LONG).show();}); root.addView(start);
    TextView note=new TextView(this); note.setText("\nВажно: кнопка «Найти телефон» и другие фирменные функции часов этим приложением не переназначаются."); note.setTextColor(0xffffb703); root.addView(note); setContentView(root);
  }
  java.util.List<String> getLaunchableApps(){java.util.List<String> out=new java.util.ArrayList<>(); android.content.pm.PackageManager pm=getPackageManager(); java.util.List<android.content.pm.ApplicationInfo> apps=pm.getInstalledApplications(0); for(android.content.pm.ApplicationInfo ai:apps){if(pm.getLaunchIntentForPackage(ai.packageName)!=null)out.add(pm.getApplicationLabel(ai).toString()+" ["+ai.packageName+"]");} java.util.Collections.sort(out); return out;}
}
